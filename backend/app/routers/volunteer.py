from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from app.utils.notifications import create_notification
from app.database import db
from app.dependencies.roles import require_volunteer

router = APIRouter(
    prefix="/volunteer",
    tags=["Volunteer Dashboard"]
)


@router.get("/tasks")
def get_my_tasks(
    current_user=Depends(require_volunteer)
):

    tasks = []

    complaints = db.complaints.find(
        {
            "assigned_to": str(current_user["_id"])
        }
    )

    for complaint in complaints:

        complaint["id"] = str(complaint["_id"])
        del complaint["_id"]

        tasks.append(complaint)

    return tasks


@router.put("/tasks/{complaint_id}/complete")
def complete_task(
    complaint_id: str,
    current_user=Depends(require_volunteer)
):

    # Validate complaint ID
    try:
        complaint_object_id = ObjectId(complaint_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID"
        )

    # Find complaint assigned to this volunteer
    complaint = db.complaints.find_one(
        {
            "_id": complaint_object_id,
            "assigned_to": str(current_user["_id"])
        }
    )

    # ── BUG FIX: Guard must come BEFORE using complaint ──────────────────────
    # Previously create_notification() ran before this check, causing
    # TypeError: 'NoneType' is not subscriptable and a 500 error when the
    # complaint wasn't found — meaning no notification ever got saved.
    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found or not assigned to you"
        )

    # Don't allow completing an already completed task
    if complaint["status"] == "Completed":
        raise HTTPException(
            status_code=400,
            detail="Task is already completed"
        )

    # Don't allow completing a verified task
    if complaint["status"] == "Verified":
        raise HTTPException(
            status_code=400,
            detail="Task has already been verified"
        )

    now = datetime.utcnow()

    # Add history entry
    history_entry = {
        "status": "Completed",
        "changed_by": str(current_user["_id"]),
        "changed_at": now
    }

    # Update complaint status to Completed
    db.complaints.update_one(
        {
            "_id": complaint_object_id
        },
        {
            "$set": {
                "status": "Completed",
                "updated_at": now
            },
            "$push": {
                "history": history_entry
            }
        }
    )

    complaint_title = complaint.get("title", "a complaint")

    # ── Notify the student who filed the complaint ────────────────────────────
    if complaint.get("created_by"):
        create_notification(
            user_id=complaint["created_by"],
            message=f"Your complaint '{complaint_title}' has been marked as completed by the volunteer and is awaiting admin verification.",
            notification_type="completion"
        )

    # ── BUG FIX: Notify ALL admins that a task needs verification ────────────
    # Previously no admin notification was sent at all. Admins had no way to
    # know a task was completed without manually refreshing the complaints list.
    admins = db.users.find({"role": "admin"})
    volunteer_name = current_user.get("name", "A volunteer")

    for admin in admins:
        create_notification(
            user_id=str(admin["_id"]),
            message=f"Task completed: '{complaint_title}' has been marked as completed by {volunteer_name} and is ready for your verification.",
            notification_type="completion"
        )

    return {
        "message": "Task marked as completed!"
    }


@router.get("/dashboard")
def volunteer_dashboard(
    current_user=Depends(require_volunteer)
):

    complaints = list(
        db.complaints.find(
            {
                "assigned_to": str(current_user["_id"])
            }
        )
    )

    assigned = sum(
        1 for c in complaints if c["status"] == "Assigned"
    )

    completed = sum(
        1 for c in complaints if c["status"] == "Completed"
    )

    verified = sum(
        1 for c in complaints if c["status"] == "Verified"
    )

    return {
        "assigned": assigned,
        "completed": completed,
        "verified": verified,
        "xp": current_user.get("xp", 0),
        "badge": current_user.get("badge", "None")
    }