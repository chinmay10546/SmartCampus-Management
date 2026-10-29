from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import db
from app.routers.auth import router as auth_router
from app.routers.volunteers import router as volunteer_router
from app.routers.complaint import router as complaint_router
from app.routers.admin import router as admin_router
from app.routers.volunteer import router as volunteer_dashboard_router
from app.routers.student import router as student_router
from app.routers.analytics import router as analytics_router
from app.routers.notifications import router as notification_router

app = FastAPI(
    title="Volunteer Management API",
    version="1.0.0"
)

# ── CORS must be added BEFORE routers ────────────────────────────────────────
# Allow any localhost port so it works on 5173, 5174, 3000, etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files ──────────────────────────────────────────────────────────────
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Backend is running 🚀",
        "database": db.name
    }

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(volunteer_router)
app.include_router(complaint_router)
app.include_router(admin_router)
app.include_router(volunteer_dashboard_router)
app.include_router(student_router)
app.include_router(analytics_router)
app.include_router(notification_router)