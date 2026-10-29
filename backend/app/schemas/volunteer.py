from pydantic import BaseModel, EmailStr

class Volunteer(BaseModel):
    name: str
    email: EmailStr
    phone: str