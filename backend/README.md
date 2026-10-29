# Volunteer Management System – Backend

## Overview
Backend for managing college complaints and volunteers using FastAPI and MongoDB Atlas.

## Features
- JWT authentication
- Role-based authorization
- Student complaint management
- Admin complaint assignment and verification
- Volunteer task management
- Notifications
- Complaint history
- XP and badges
- Search, filtering and pagination
- Analytics

## Complaint Workflow
Pending → Assigned → Completed → Verified

## User Roles
- **Student** – creates and tracks complaints
- **Volunteer** – handles assigned complaints and earns XP
- **Admin** – manages, assigns and verifies complaints

## XP & Badges

| XP | Badge |
|---:|---|
| 0–99 | None |
| 100–299 | Bronze |
| 300–699 | Silver |
| 700–1499 | Gold |
| 1500+ | Platinum |

Each verified complaint awards the volunteer **50 XP**.

## Technology Stack
Python, FastAPI, MongoDB Atlas, PyMongo, JWT, Passlib, Bcrypt, Pydantic, Uvicorn

## Setup

```bash
python -m pip install -r requirements.txt