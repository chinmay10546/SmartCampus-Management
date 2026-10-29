from fastapi import APIRouter, Depends
from app.database import db
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/student",
    tags=["Student Dashboard"]
)


@router.get("/dashboard")
def student_dashboard(
    current_user=Depends(get_current_user)
):

    complaints = list(
        db.complaints.find(
            {
                "created_by": str(current_user["_id"])
            }
        )
    )

    total = len(complaints)

    pending = sum(
        1 for c in complaints if c["status"] == "Pending"
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
        "total_complaints": total,
        "pending": pending,
        "assigned": assigned,
        "completed": completed,
        "verified": verified
    }