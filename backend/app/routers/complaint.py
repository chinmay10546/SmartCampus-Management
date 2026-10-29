from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from datetime import datetime
from typing import Literal
from pathlib import Path
from uuid import uuid4

from bson import ObjectId
from bson.errors import InvalidId

from app.database import db
from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# =========================================================
# UPLOAD SETTINGS
# =========================================================

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# =========================================================
# CREATE COMPLAINT
# =========================================================

@router.post("")
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: Literal[
        "Hostel",
        "Classroom",
        "Electricity",
        "Water",
        "Cleaning",
        "Other"
    ] = Form(...),
    priority: Literal[
        "Low",
        "Medium",
        "High"
    ] = Form(...),
    location: str = Form(...),

    attachment: UploadFile | None = File(None),

    current_user=Depends(get_current_user)
):

    now = datetime.utcnow()

    # =====================================================
    # HANDLE ATTACHMENT
    # =====================================================

    attachment_data = None

    if attachment is not None:

        # Get extension
        extension = Path(
            attachment.filename or ""
        ).suffix.lower()

        # Validate extension
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, JPEG, PNG and WEBP files are allowed"
            )

        # Read file
        file_data = await attachment.read()

        # Validate file size
        if len(file_data) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size must be 5 MB or less"
            )

        # Generate unique filename
        filename = f"{uuid4().hex}{extension}"

        file_path = UPLOAD_DIR / filename

        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_data)

        attachment_data = {
            "filename": attachment.filename,
            "stored_filename": filename,
            "path": f"/uploads/{filename}",
            "content_type": attachment.content_type
        }

    # =====================================================
    # CREATE COMPLAINT
    # =====================================================

    complaint_dict = {
        "title": title,
        "description": description,
        "category": category,
        "priority": priority,
        "location": location,

        "status": "Pending",

        "created_by": str(current_user["_id"]),

        "assigned_to": None,

        "created_at": now,
        "updated_at": now,

        "history": [
            {
                "status": "Pending",
                "changed_by": str(current_user["_id"]),
                "changed_at": now
            }
        ]
    }

    # Add attachment only if one exists
    if attachment_data is not None:
        complaint_dict["attachment"] = attachment_data

    result = db.complaints.insert_one(
        complaint_dict
    )

    return {
        "message": "Complaint created successfully!",
        "id": str(result.inserted_id)
    }


# =========================================================
# GET COMPLAINTS
# =========================================================

@router.get("")
def get_complaints(
    current_user=Depends(get_current_user)
):

    complaints = []

    if current_user["role"] == "admin":

        data = db.complaints.find()

    elif current_user["role"] == "student":

        data = db.complaints.find(
            {
                "created_by": str(current_user["_id"])
            }
        )

    else:

        data = db.complaints.find(
            {
                "assigned_to": str(current_user["_id"])
            }
        )

    for complaint in data:

        complaint["id"] = str(
            complaint["_id"]
        )

        del complaint["_id"]

        complaints.append(complaint)

    return complaints


# =========================================================
# GET COMPLAINT HISTORY
# =========================================================

@router.get("/{complaint_id}/history")
def get_complaint_history(
    complaint_id: str,
    current_user=Depends(get_current_user)
):

    # Validate ID
    try:
        complaint_object_id = ObjectId(
            complaint_id
        )

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint ID"
        )

    # Find complaint
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

    # Student can only see their own complaint
    if current_user["role"] == "student":

        if complaint["created_by"] != str(
            current_user["_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You can only view your own complaint history"
            )

    # Volunteer can only see assigned complaint
    elif current_user["role"] == "volunteer":

        if complaint.get("assigned_to") != str(
            current_user["_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You can only view history of assigned complaints"
            )

    return {
        "complaint_id": complaint_id,
        "history": complaint.get(
            "history",
            []
        )
    }