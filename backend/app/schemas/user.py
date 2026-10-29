from pydantic import BaseModel, EmailStr
from typing import Literal


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: Literal["student", "volunteer", "admin"] = "student"