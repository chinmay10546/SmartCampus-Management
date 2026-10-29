from fastapi import APIRouter, HTTPException
from app.database import db
from app.schemas.volunteer import Volunteer
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


@router.post("")
def create_volunteer(volunteer: Volunteer):
    volunteer_dict = volunteer.model_dump()

    result = db.volunteers.insert_one(volunteer_dict)

    return {
        "message": "Volunteer added successfully!",
        "id": str(result.inserted_id)
    }


@router.get("")
def get_volunteers():
    volunteers = []

    for volunteer in db.volunteers.find():
        volunteer["id"] = str(volunteer["_id"])
        del volunteer["_id"]
        volunteers.append(volunteer)

    return volunteers


@router.get("/{id}")
def get_volunteer(id: str):
    try:
        object_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid volunteer ID")

    volunteer = db.volunteers.find_one({"_id": object_id})

    if volunteer is None:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    volunteer["id"] = str(volunteer["_id"])
    del volunteer["_id"]

    return volunteer


@router.put("/{id}")
def update_volunteer(id: str, volunteer: Volunteer):
    try:
        object_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid volunteer ID")

    result = db.volunteers.update_one(
        {"_id": object_id},
        {"$set": volunteer.model_dump()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    return {
        "message": "Volunteer updated successfully!"
    }


@router.delete("/{id}")
def delete_volunteer(id: str):
    try:
        object_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid volunteer ID")

    result = db.volunteers.delete_one({"_id": object_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    return {
        "message": "Volunteer deleted successfully!"
    }