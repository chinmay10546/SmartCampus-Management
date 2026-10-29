from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from app.database import db
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# GET ALL NOTIFICATIONS
# =========================================================

@router.get("")
def get_notifications(
    current_user=Depends(get_current_user)
):

    notifications = list(
        db.notifications.find(
            {
                "user_id": str(current_user["_id"])
            }
        ).sort(
            "created_at",
            -1
        )
    )

    for notification in notifications:
        notification["id"] = str(notification["_id"])
        del notification["_id"]

    return notifications


# =========================================================
# GET UNREAD NOTIFICATIONS
# =========================================================

@router.get("/unread")
def get_unread_notifications(
    current_user=Depends(get_current_user)
):

    notifications = list(
        db.notifications.find(
            {
                "user_id": str(current_user["_id"]),
                "is_read": False
            }
        ).sort(
            "created_at",
            -1
        )
    )

    for notification in notifications:
        notification["id"] = str(notification["_id"])
        del notification["_id"]

    return notifications


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@router.put("/read-all")
def mark_all_notifications_read(
    current_user=Depends(get_current_user)
):

    result = db.notifications.update_many(
        {
            "user_id": str(current_user["_id"]),
            "is_read": False
        },
        {
            "$set": {
                "is_read": True,
                "read_at": datetime.utcnow()
            }
        }
    )

    return {
        "message": "All notifications marked as read!",
        "updated": result.modified_count
    }


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user)
):

    try:
        notification_object_id = ObjectId(
            notification_id
        )

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    notification = db.notifications.find_one(
        {
            "_id": notification_object_id,
            "user_id": str(current_user["_id"])
        }
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    db.notifications.update_one(
        {
            "_id": notification_object_id
        },
        {
            "$set": {
                "is_read": True,
                "read_at": datetime.utcnow()
            }
        }
    )

    return {
        "message": "Notification marked as read!"
    }