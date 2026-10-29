from fastapi import Depends, HTTPException

from app.dependencies.auth import get_current_user


def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def require_student(current_user=Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    return current_user


def require_volunteer(current_user=Depends(get_current_user)):
    if current_user["role"] != "volunteer":
        raise HTTPException(
            status_code=403,
            detail="Volunteer access required"
        )

    return current_user