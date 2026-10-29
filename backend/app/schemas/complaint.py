from pydantic import BaseModel
from typing import Literal


class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: Literal[
        "Hostel",
        "Classroom",
        "Electricity",
        "Water",
        "Cleaning",
        "Other"
    ]
    priority: Literal[
        "Low",
        "Medium",
        "High"
    ]
    location: str