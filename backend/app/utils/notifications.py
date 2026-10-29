from datetime import datetime

from app.database import db


def create_notification(
    user_id: str,
    message: str,
    notification_type: str = "general"
):
    notification = {
        "user_id": user_id,
        "message": message,
        "type": notification_type,
        "is_read": False,
        "created_at": datetime.utcnow(),
        "read_at": None
    }

    db.notifications.insert_one(notification)