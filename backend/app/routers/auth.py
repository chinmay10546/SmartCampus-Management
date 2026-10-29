from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.database import db
from app.schemas.user import UserRegister
from app.utils.security import hash_password, verify_password
from app.utils.token import create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.post("/register")
def register(user: UserRegister):

    # Check if email already exists
    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Convert user to dictionary
    user_dict = user.model_dump()

    # Hash password
    user_dict["password"] = hash_password(user.password)

    # Default fields
    user_dict["xp"] = 0
    user_dict["badge"] = "None"
    user_dict["is_active"] = True

    # Save user
    result = db.users.insert_one(user_dict)

    return {
        "message": "User registered successfully!",
        "id": str(result.inserted_id)
    }


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    
   

    user = db.users.find_one({"email": form_data.username})

    

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_ok = verify_password(
        form_data.password,
        user["password"]
    )


    if not password_ok:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "email": user["email"],
            "role": user["role"]
        }
    )

   

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "xp": current_user.get("xp", 0),
        "badge": current_user.get("badge", "None"),
        "is_active": current_user.get("is_active", True)
    }
@router.get("/debug-users")
def debug_users():
    users = []

    for user in db.users.find():
        users.append({
            "email": user.get("email"),
            "role": user.get("role")
        })

    return users