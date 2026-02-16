# backend/main.py
from datetime import datetime, timedelta
from typing import List, Optional
import os
from dotenv import load_dotenv

import random
import string
import smtplib
from email.message import EmailMessage

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from passlib.hash import bcrypt
from fastapi import APIRouter
from .models import (
    users_collection,
    projects_collection,
    categories_collection,
    backlinks_collection,
    project_media_collection,
)
from .schemas import (
    UserCreate,
    UserOut,
    ProjectCreate,
    ProjectOut,
    ProjectMediaCreate,        # NEW
    ProjectMediaOut,
    CategoryCreate,
    CategoryOut,
    BacklinkCreate,
    BacklinkOut,
)

app = FastAPI(title="Backlink Digital API")

# Allow your React dev server
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://klon-backlink.vercel.app",
    "https://klon-backlink-git-main-theklon.vercel.app",  # preview URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= SMTP / OTP HELPERS =================

load_dotenv()  # load from .env in development

SMTP_HOST = os.getenv("SMTP_HOST", "email-smtp.us-east-1.amazonaws.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM")

if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM]):
    raise RuntimeError("SMTP environment variables are not fully set")


def generate_otp(length: int = 6) -> str:
    """Generate numeric OTP like '123456'."""
    return "".join(random.choices(string.digits, k=length))


def send_otp_email(to_email: str, otp: str) -> None:
    """Send OTP email via SMTP."""
    msg = EmailMessage()
    msg["Subject"] = "Your OTP Code"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(f"Your OTP code is: {otp}\nIt is valid for 10 minutes.")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


@app.get("/health")
async def health():
    return {"status": "ok"}


# ================= AUTH: OTP + LOGIN =================
@app.get("/")
async def root():
    return {"status": "ok"}


@app.post("/api/auth/request-otp")
async def request_otp(payload: dict):
    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email is not registered by admin",
        )

    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "otpCode": otp,
                "otpExpiresAt": expires_at,
            }
        },
    )

    try:
        send_otp_email(email, otp)
    except Exception as e:
        print("Failed to send OTP email:", e)

    print("TEST OTP for", email, "=", otp)
    return {"message": "OTP sent"}


@app.post("/api/auth/login-with-otp")
async def login_with_otp(payload: dict):
    email = payload.get("email", "").strip().lower()
    otp = payload.get("otp", "").strip()

    if not (email and otp):
        raise HTTPException(status_code=400, detail="Missing fields")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Email is not registered by admin")

    stored_otp = user.get("otpCode")
    expires_at: Optional[datetime] = user.get("otpExpiresAt")

    if not stored_otp or not expires_at:
        raise HTTPException(status_code=400, detail="No OTP requested")

    if datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    if otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$unset": {
                "otpCode": "",
                "otpExpiresAt": "",
            }
        },
    )

    return {
        "message": "Login OK",
        "userId": str(user["_id"]),
        "role": user.get("role", "user"),
        "email": user.get("email"),
        "name": user.get("name"),
    }


@app.post("/api/auth/verify-otp-set-password")
async def verify_otp_set_password(payload: dict):
    """
    Step 2 of signup:
    - User submits email, otp, password.
    - If OTP is valid & not expired, set passwordHash and mark isVerified.
    """
    email = payload.get("email", "").strip().lower()
    otp = payload.get("otp", "").strip()
    password = payload.get("password", "")

    if not (email and otp and password):
        raise HTTPException(status_code=400, detail="Missing fields")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Email is not registered by admin")

    stored_otp = user.get("otpCode")
    expires_at: Optional[datetime] = user.get("otpExpiresAt")

    if not stored_otp or not expires_at:
        raise HTTPException(status_code=400, detail="No OTP requested")

    if datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    if otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    password_hash = bcrypt.hash(password)

    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "passwordHash": password_hash,
                "isVerified": True,
                "status": user.get("status", "active"),
            },
            "$unset": {
                "otpCode": "",
                "otpExpiresAt": "",
            },
        },
    )

    return {"message": "Password set successfully"}


@app.post("/api/auth/login")
async def login(payload: dict):
    """
    Login:
    - Only emails created by admin & verified (OTP + password set) can log in.
    """
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not (email and password):
        raise HTTPException(status_code=400, detail="Missing fields")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not user.get("isVerified") or not user.get("passwordHash"):
        raise HTTPException(
            status_code=400,
            detail="Account not activated. Please sign up with OTP first.",
        )

    if not bcrypt.verify(password, user["passwordHash"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login OK",
        "userId": str(user["_id"]),
        "role": user.get("role"),
        "email": user.get("email"),
    }


# ==== USERS (for Admin Users page) ====


@app.post("/api/admin/users", response_model=UserOut)
async def create_user(user: UserCreate):
    now = datetime.utcnow()
    doc = {
        "empId": user.empId,
        "name": user.name,
        "email": user.email.lower(),
        "role": user.role,
        "status": user.status,
        "points": user.points,
        "passwordHash": user.password,  # NOTE: plain for demo
        "isVerified": False,
        "createdAt": now,
        "updatedAt": now,
    }
    res = await users_collection.insert_one(doc)
    created = await users_collection.find_one({"_id": res.inserted_id})
    if created and "_id" in created:
        created["_id"] = str(created["_id"])
    return created


@app.put("/api/admin/users/{user_id}", response_model=UserOut)
async def update_user(user_id: str, user: UserCreate):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user id")

    now = datetime.utcnow()
    update_doc = {
        "empId": user.empId,
        "name": user.name,
        "email": user.email.lower(),
        "role": user.role,
        "status": user.status,
        "points": user.points,
        "updatedAt": now,
    }
    res = await users_collection.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_doc},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="User not found")

    res["_id"] = str(res["_id"])
    return res


@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user id")

    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"deleted": True}


@app.get("/api/admin/users", response_model=List[UserOut])
async def list_users():
    users = await users_collection.find().to_list(length=1000)
    for u in users:
        if "_id" in u:
            u["_id"] = str(u["_id"])
    return users


# ==== PROJECTS (social links update) ====


@app.put("/api/projects/{project_id}")
async def update_project_info(project_id: str, payload: dict):
    update_fields = {
        "instagramUrl": payload.get("instagramUrl", "").strip(),
        "facebookUrl": payload.get("facebookUrl", "").strip(),
        "twitterUrl": payload.get("twitterUrl", "").strip(),
    }

    await projects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_fields},
    )

    updated = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")

    updated["id"] = str(updated["_id"])
    del updated["_id"]
    return updated


# ==== PROJECTS (Admin + User View) ====


@app.post("/api/admin/projects", response_model=ProjectOut)
async def create_project(project: ProjectCreate):
    now = datetime.utcnow()
    doc = {
        "name": project.name,
        "url": project.url,
        "description": project.description,
        "ownerUserId": project.ownerUserId,
        "status": project.status,
        "createdAt": now,
        "updatedAt": now,
    }
    res = await projects_collection.insert_one(doc)
    created = await projects_collection.find_one({"_id": res.inserted_id})
    if created and "_id" in created:
        created["_id"] = str(created["_id"])
    return created


# ==== PROJECT MEDIA ====


@app.post(
    "/api/projects/{project_id}/media",
    response_model=List[ProjectMediaOut],
)
async def add_project_media(project_id: str, items: List[ProjectMediaCreate]):
    now = datetime.utcnow()
    docs = []
    for item in items:
        doc = item.dict()
        doc["projectId"] = project_id
        doc["createdAt"] = doc.get("createdAt") or now
        docs.append(doc)

    if not docs:
        return []

    res = await project_media_collection.insert_many(docs)
    inserted_ids = res.inserted_ids

    saved = await project_media_collection.find(
        {"_id": {"$in": inserted_ids}}
    ).to_list(length=len(inserted_ids))

    for d in saved:
        d["_id"] = str(d["_id"])
    return saved


@app.get(
    "/api/projects/{project_id}/media",
    response_model=List[ProjectMediaOut],
)
async def list_project_media(project_id: str, kind: str | None = None):
    query = {"projectId": project_id}
    if kind:
        query["kind"] = kind

    items = await project_media_collection.find(query).to_list(length=1000)
    for it in items:
        if "_id" in it:
            it["_id"] = str(it["_id"])
    return items


@app.delete("/api/projects/{project_id}/media/{media_id}")
async def delete_project_media(project_id: str, media_id: str):
    if not ObjectId.is_valid(media_id):
        raise HTTPException(status_code=400, detail="Invalid media id")

    result = await project_media_collection.delete_one(
        {"_id": ObjectId(media_id), "projectId": project_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"deleted": True}


@app.put("/api/admin/projects/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, project: ProjectCreate):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")

    now = datetime.utcnow()
    update_doc = {
        "name": project.name,
        "url": project.url,
        "description": project.description,
        "ownerUserId": project.ownerUserId,
        "status": project.status,
        "updatedAt": now,
    }
    res = await projects_collection.find_one_and_update(
        {"_id": ObjectId(project_id)},
        {"$set": update_doc},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Project not found")

    res["_id"] = str(res["_id"])
    return res


@app.delete("/api/admin/projects/{project_id}")
async def delete_project(project_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project id")

    result = await projects_collection.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"deleted": True}


@app.get("/api/projects", response_model=List[ProjectOut])
async def list_projects(
    search: str | None = None,
    ownerUserId: str | None = None,
):
    query: dict = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if ownerUserId:
        query["ownerUserId"] = ownerUserId

    projects = await projects_collection.find(query).to_list(length=1000)
    for p in projects:
        if "_id" in p:
            p["_id"] = str(p["_id"])
    return projects


# ==== CATEGORIES ====


@app.post("/api/admin/categories", response_model=CategoryOut)
async def create_category(cat: CategoryCreate):
    now = datetime.utcnow()
    doc = {
        "name": cat.name,
        "description": cat.description,
        "isActive": cat.isActive,
        "createdAt": now,
        "updatedAt": now,
    }
    res = await categories_collection.insert_one(doc)
    created = await categories_collection.find_one({"_id": res.inserted_id})
    if created and "_id" in created:
        created["_id"] = str(created["_id"])
    return created


@app.put("/api/admin/categories/{category_id}", response_model=CategoryOut)
async def update_category(category_id: str, cat: CategoryCreate):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category id")

    now = datetime.utcnow()
    update_doc = {
        "name": cat.name,
        "description": cat.description,
        "isActive": cat.isActive,
        "updatedAt": now,
    }
    res = await categories_collection.find_one_and_update(
        {"_id": ObjectId(category_id)},
        {"$set": update_doc},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Category not found")

    res["_id"] = str(res["_id"])
    return res


@app.delete("/api/admin/categories/{category_id}")
async def delete_category(category_id: str):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category id")

    result = await categories_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"deleted": True}


@app.get("/api/categories", response_model=List[CategoryOut])
async def list_categories():
    cats = await categories_collection.find({"isActive": True}).to_list(length=1000)
    for c in cats:
        if "_id" in c:
            c["_id"] = str(c["_id"])
    return cats


# ==== BACKLINKS (User Backlinks page) ====


@app.post("/api/user/backlinks", response_model=BacklinkOut)
async def create_backlink(backlink: BacklinkCreate):
    now = datetime.utcnow()
    doc = backlink.dict()
    doc["createdAt"] = now
    doc["updatedAt"] = now
    doc.setdefault("contributions", [])
    doc.setdefault("contribute", {"points": 0})

    res = await backlinks_collection.insert_one(doc)
    created = await backlinks_collection.find_one({"_id": res.inserted_id})
    if created and "_id" in created:
        created["_id"] = str(created["_id"])
    return created


@app.get("/api/user/backlinks", response_model=List[BacklinkOut])
async def list_backlinks(
    projectId: str | None = None,
    categoryId: str | None = None,
    ownerUserId: str | None = None,
):
    query: dict = {}
    if projectId:
        query["projectId"] = projectId
    if categoryId:
        query["categoryId"] = categoryId
    if ownerUserId:
        query["ownerUserId"] = ownerUserId

    links = await backlinks_collection.find(query).to_list(length=1000)
    for l in links:
        if "_id" in l:
            l["_id"] = str(l["_id"])
    return links


@app.put("/api/user/backlinks/{backlink_id}", response_model=BacklinkOut)
async def update_backlink(backlink_id: str, backlink: BacklinkCreate):
    if not ObjectId.is_valid(backlink_id):
        raise HTTPException(status_code=400, detail="Invalid backlink id")

    now = datetime.utcnow()
    update_doc = backlink.dict()
    update_doc["updatedAt"] = now

    res = await backlinks_collection.find_one_and_update(
        {"_id": ObjectId(backlink_id)},
        {"$set": update_doc},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Backlink not found")

    res["_id"] = str(res["_id"])
    return res

 
from playwright.async_api import async_playwright

@app.post("/api/social/metrics")
async def get_social_metrics(payload: dict):
    platform = (payload.get("platform") or "").lower().strip()
    url = (payload.get("url") or "").strip()

    if not platform or not url:
        raise HTTPException(status_code=400, detail="platform and url are required")

    # basic safety to avoid SSRF
    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid URL")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            await page.goto(url, wait_until="networkidle")

            if platform == "instagram":
                metrics = await scrape_instagram(page)
            elif platform == "facebook":
                metrics = await scrape_facebook(page)
            elif platform == "twitter":
                metrics = await scrape_twitter(page)
            else:
                await browser.close()
                raise HTTPException(status_code=400, detail="Unsupported platform")

            await browser.close()
            return metrics
    except HTTPException:
        raise
    except Exception as e:
        # log e in real code
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch social metrics: {str(e)}"
        )


async def scrape_instagram(page):
    """
    Example-only: Instagram HTML changes often and many pages require login,
    so you will have to adapt selectors / logic and possibly handle login.
    """
    # Wait for some text that usually contains counts, e.g. profile header
    # Adjust selector based on real page HTML you see in devtools.
    await page.wait_for_timeout(3000)

    content = await page.content()

    # VERY naive regex-based extraction; you will need to customize:
    import re

    followers = 0
    following = 0
    posts = 0

    # Example patterns like '1,234 followers', '567 following', '89 posts'
    followers_match = re.search(r"([\d,.]+)\s+followers", content, re.I)
    following_match = re.search(r"([\d,.]+)\s+following", content, re.I)
    posts_match = re.search(r"([\d,.]+)\s+posts", content, re.I)

    if followers_match:
        followers = int(followers_match.group(1).replace(",", "").replace(".", ""))
    if following_match:
        following = int(following_match.group(1).replace(",", "").replace(".", ""))
    if posts_match:
        posts = int(posts_match.group(1).replace(",", "").replace(".", ""))

    return {"posts": posts, "followers": followers, "following": following}


async def scrape_facebook(page):
    await page.wait_for_timeout(3000)
    content = await page.content()
    import re

    followers = 0
    following = 0
    posts = 0

    followers_match = re.search(r"([\d,.]+)\s+followers", content, re.I)
    if followers_match:
        followers = int(followers_match.group(1).replace(",", "").replace(".", ""))

    # Facebook doesn't expose "following" or "posts" consistently without login,
    # so you might just return 0 or some best-effort value.
    return {"posts": posts, "followers": followers, "following": following}


async def scrape_twitter(page):
    await page.wait_for_timeout(3000)
    content = await page.content()
    import re

    followers = 0
    following = 0
    posts = 0

    # Example naive patterns; you'll need to view the HTML source and tune this.
    followers_match = re.search(r"([\d,.]+)\s+Followers", content, re.I)
    following_match = re.search(r"([\d,.]+)\s+Following", content, re.I)
    posts_match = re.search(r"([\d,.]+)\s+Posts", content, re.I)

    if followers_match:
        followers = int(followers_match.group(1).replace(",", "").replace(".", ""))
    if following_match:
        following = int(following_match.group(1).replace(",", "").replace(".", ""))
    if posts_match:
        posts = int(posts_match.group(1).replace(",", "").replace(".", ""))

    return {"posts": posts, "followers": followers, "following": following}
@app.put("/api/user/backlinks/{backlink_id}/contribute")
async def set_backlink_contribution(backlink_id: str, payload: dict):
    if not ObjectId.is_valid(backlink_id):
        raise HTTPException(status_code=400, detail="Invalid backlink id")

    sub_backlink_id = (payload.get("subBacklinkId") or "").strip()
    password = (payload.get("password") or "").strip()
    sub_url = (payload.get("subUrl") or "").strip()
    user_id = (payload.get("userId") or "").strip()
    user_name = (payload.get("userName") or "").strip()

    doc = await backlinks_collection.find_one({"_id": ObjectId(backlink_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Backlink not found")

    contributions = doc.get("contributions") or []

    new_entry = {
        "subBacklinkId": sub_backlink_id,
        "password": password,
        "subUrl": sub_url,
        "createdAt": datetime.utcnow(),
        "userId": user_id,
        "userName": user_name,
    }
    contributions.append(new_entry)

    total_points = len(contributions)

    update_fields = {
        "contributions": contributions,
        "contribute": {"points": total_points},
        "updatedAt": datetime.utcnow(),
    }

    result = await backlinks_collection.update_one(
        {"_id": ObjectId(backlink_id)},
        {"$set": update_fields},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Backlink not found")

    updated = await backlinks_collection.find_one({"_id": ObjectId(backlink_id)})
    updated["id"] = str(updated["_id"])
    del updated["_id"]
    return updated


@app.delete("/api/user/backlinks/{backlink_id}")
async def delete_backlink(backlink_id: str):
    if not ObjectId.is_valid(backlink_id):
        raise HTTPException(status_code=400, detail="Invalid backlink id")

    result = await backlinks_collection.delete_one({"_id": ObjectId(backlink_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Backlink not found")

    return {"deleted": True}


# ==== DASHBOARD STATS ====


@app.get("/api/admin/stats")
async def admin_stats():
    total_users = await users_collection.count_documents({})
    total_projects = await projects_collection.count_documents({})
    total_backlinks = await backlinks_collection.count_documents({})
    return {
        "totalUsers": total_users,
        "totalProjects": total_projects,
        "totalBacklinks": total_backlinks,
    }