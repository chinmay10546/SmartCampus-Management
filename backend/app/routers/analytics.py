from fastapi import APIRouter, Depends
from app.database import db
from app.dependencies.roles import require_admin

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/categories")
def complaints_by_category(
    current_user=Depends(require_admin)
):

    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1}
            }
        }
    ]

    data = list(db.complaints.aggregate(pipeline))

    return data
@router.get("/priority")
def complaints_by_priority(
    current_user=Depends(require_admin)
):

    pipeline = [
        {
            "$group": {
                "_id": "$priority",
                "count": {"$sum": 1}
            }
        }
    ]

    return list(
        db.complaints.aggregate(pipeline)
    )
@router.get("/status")
def complaints_by_status(
    current_user=Depends(require_admin)
):

    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]

    return list(
        db.complaints.aggregate(pipeline)
    )
@router.get("/leaderboard")
def leaderboard(
    current_user=Depends(require_admin)
):

    volunteers = list(
        db.users.find(
            {"role": "volunteer"},
            {
                "password": 0
            }
        ).sort(
            "xp",
            -1
        )
    )

    for volunteer in volunteers:
        volunteer["id"] = str(volunteer["_id"])
        del volunteer["_id"]

    return volunteers