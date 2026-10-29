from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.database import db
from app.dependencies.roles import require_admin
from app.schemas.assignment import AssignVolunteer
from app.utils.badge import calculate_badge
from app.utils.notifications import create_notification


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# GET VOLUNTEER USERS (for the assign-volunteer dropdown)
# Returns users registered with role="volunteer" from db.users
# This is the correct source — assign endpoint also uses db.users
# =========================================================

@router.get("/users/volunteers")
def get_volunteer_users(current_user=Depends(require_admin)):
    volunteers = []
    for user in db.users.find({"role": "volunteer"}):
        volunteers.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "xp": user.get("xp", 0),
            "badge": user.get("badge", "None"),
        })
    return volunteers


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@router.get("/complaints")
def get_all_complaints(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort: str = Query("newest"),
    current_user=Depends(require_admin)
):

    query = {}

    if status:
        query["status"] = status

    if priority:
        query["priority"] = priority

    if category:
        query["category"] = category

    skip = (page - 1) * limit

    sort_order = -1 if sort == "newest" else 1

    complaints = list(
        db.complaints.find(query)
        .sort("created_at", sort_order)
        .skip(skip)
        .limit(limit)
    )

    for complaint in complaints:
        complaint["id"] = str(complaint["_id"])
        del complaint["_id"]

    total = db.complaints.count_documents(query)

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "data": complaints
    }


# =========================================================
# ASSIGN VOLUNTEER
# =========================================================

@router.put("/complaints/{complaint_id}/assign")
def assign_volunteer(
    complaint_id: str,
    assignment: AssignVolunteer,
    current_user=Depends(require_admin)
):

    try:
        complaint_object_id = ObjectId(complaint_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID"
        )

    complaint = db.complaints.find_one(
        {
            "_id": complaint_object_id
        }
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    try:
        volunteer_object_id = ObjectId(
            assignment.volunteer_id
        )

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid volunteer ID"
        )

    volunteer = db.users.find_one(
        {
            "_id": volunteer_object_id,
            "role": "volunteer"
        }
    )

    if volunteer is None:
        raise HTTPException(
            status_code=404,
            detail="Volunteer not found"
        )

    now = datetime.utcnow()

    history_entry = {
        "status": "Assigned",
        "changed_by": str(current_user["_id"]),
        "changed_at": now,
        "assigned_to": str(volunteer["_id"])
    }

    db.complaints.update_one(
        {
            "_id": complaint_object_id
        },
        {
            "$set": {
                "assigned_to": str(volunteer["_id"]),
                "status": "Assigned",
                "updated_at": now
            },
            "$push": {
                "history": history_entry
            }
        }
    )

    create_notification(
        user_id=str(volunteer["_id"]),
        message=f"You have been assigned a new complaint: {complaint['title']}",
        notification_type="assignment"
    )

    return {
        "message": "Volunteer assigned successfully!"
    }


# =========================================================
# VERIFY COMPLAINT
# =========================================================

@router.put("/complaints/{complaint_id}/verify")
def verify_complaint(
    complaint_id: str,
    current_user=Depends(require_admin)
):

    # Validate Complaint ID
    try:
        complaint_object_id = ObjectId(complaint_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID"
        )

    # Find Complaint
    complaint = db.complaints.find_one(
        {
            "_id": complaint_object_id
        }
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    # =====================================================
    # SECURITY CHECK:
    # Don't allow verification twice
    # =====================================================

    if complaint["status"] == "Verified":
        raise HTTPException(
            status_code=400,
            detail="Complaint has already been verified"
        )

    # =====================================================
    # Complaint must be completed first
    # =====================================================

    if complaint["status"] != "Completed":
        raise HTTPException(
            status_code=400,
            detail="Complaint must be completed before verification"
        )

    # =====================================================
    # Validate assigned volunteer
    # =====================================================

    try:
        volunteer_object_id = ObjectId(
            complaint["assigned_to"]
        )

    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid assigned volunteer ID"
        )

    # Find Volunteer
    volunteer = db.users.find_one(
        {
            "_id": volunteer_object_id,
            "role": "volunteer"
        }
    )

    if volunteer is None:
        raise HTTPException(
            status_code=404,
            detail="Assigned volunteer not found"
        )

    # =====================================================
    # ADD XP
    # =====================================================

    new_xp = volunteer.get("xp", 0) + 50

    # Calculate badge
    new_badge = calculate_badge(new_xp)

    # Update Volunteer XP and Badge
    db.users.update_one(
        {
            "_id": volunteer["_id"]
        },
        {
            "$set": {
                "xp": new_xp,
                "badge": new_badge
            }
        }
    )

    now = datetime.utcnow()

    # =====================================================
    # HISTORY
    # =====================================================

    history_entry = {
        "status": "Verified",
        "changed_by": str(current_user["_id"]),
        "changed_at": now
    }

    # =====================================================
    # UPDATE COMPLAINT
    # =====================================================

    db.complaints.update_one(
        {
            "_id": complaint_object_id
        },
        {
            "$set": {
                "status": "Verified",
                "updated_at": now
            },
            "$push": {
                "history": history_entry
            }
        }
    )

    # =====================================================
    # NOTIFY STUDENT
    # =====================================================

    create_notification(
        user_id=complaint["created_by"],
        message=f"Your complaint '{complaint['title']}' has been verified.",
        notification_type="verification"
    )

    # =====================================================
    # NOTIFY VOLUNTEER
    # =====================================================

    create_notification(
        user_id=str(volunteer["_id"]),
        message=f"Your completed complaint '{complaint['title']}' has been verified. You earned 50 XP!",
        notification_type="xp"
    )

    return {
        "message": "Complaint verified successfully!",
        "volunteer": volunteer["name"],
        "xp": new_xp,
        "badge": new_badge
    }


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(require_admin)
):

    students = db.users.count_documents(
        {
            "role": "student"
        }
    )

    volunteers = db.users.count_documents(
        {
            "role": "volunteer"
        }
    )

    admins = db.users.count_documents(
        {
            "role": "admin"
        }
    )

    pending = db.complaints.count_documents(
        {
            "status": "Pending"
        }
    )

    assigned = db.complaints.count_documents(
        {
            "status": "Assigned"
        }
    )

    completed = db.complaints.count_documents(
        {
            "status": "Completed"
        }
    )

    verified = db.complaints.count_documents(
        {
            "status": "Verified"
        }
    )

    return {
        "students": students,
        "volunteers": volunteers,
        "admins": admins,
        "pending": pending,
        "assigned": assigned,
        "completed": completed,
        "verified": verified
    }


# =========================================================
# SEARCH COMPLAINTS
# =========================================================

@router.get("/complaints/search")
def search_complaints(
    q: str,
    current_user=Depends(require_admin)
):

    complaints = list(
        db.complaints.find(
            {
                "$or": [
                    {
                        "title": {
                            "$regex": q,
                            "$options": "i"
                        }
                    },
                    {
                        "description": {
                            "$regex": q,
                            "$options": "i"
                        }
                    },
                    {
                        "location": {
                            "$regex": q,
                            "$options": "i"
                        }
                    }
                ]
            }
        )
    )

    for complaint in complaints:
        complaint["id"] = str(complaint["_id"])
        del complaint["_id"]

    return complaints