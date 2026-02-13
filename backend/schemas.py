from typing import Optional, Any, List, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from bson import ObjectId


class BaseMongoModel(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
        from_attributes=True,
    )


# ==== USER ====

class UserBase(BaseMongoModel):
    empId: int
    name: str
    email: EmailStr
    role: str = "user"          # "admin" or "user"
    status: str = "active"
    points: int = 0


class UserCreate(UserBase):
    password: str               # plain on input – you will hash in code


class UserOut(UserBase):
    id: Any = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime


# ==== PROJECT ====

class ProjectBase(BaseMongoModel):
    name: str
    url: str
    description: Optional[str] = None
    ownerUserId: Optional[str] = None  # store as string id
    status: str = "active"


class ProjectCreate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    id: Any = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime
# ==== PROJECT MEDIA ====

class ProjectMediaBase(BaseMongoModel):
    projectId: str          # string id or project name; match what frontend uses
    kind: str               # "image", "video", "file"
    name: str               # display name (Image Name 1, etc.)
    url: str | None = None  # optional; for videos/files or external images
    dataUrl: str | None = None  # for inline image data (base64), optional
    createdAt: datetime | None = None

class ProjectMediaCreate(ProjectMediaBase):
    pass

class ProjectMediaOut(ProjectMediaBase):
    id: Any = Field(alias="_id")

# ==== CATEGORY ====

class CategoryBase(BaseMongoModel):
    name: str
    description: Optional[str] = None
    isActive: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: Any = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime


# ==== BACKLINK ====

class ContributionEntry(BaseMongoModel):
    subBacklinkId: str
    password: str
    subUrl: Optional[str] = None
    createdAt: datetime

class BacklinkBase(BaseMongoModel):
    projectId: str              # string id of project
    createdByUserId: str        # string id of user
    domain: str
    categoryId: str             # string id of category
    da: int
    ss: int
    url: str
    # total points summary, e.g. {"points": 190}
    contribute: Optional[Dict[str, int]] = None
    # list of sub backlinks
    contributions: Optional[List[ContributionEntry]] = None
    status: str = "approved"


class BacklinkCreate(BacklinkBase):
    pass


class BacklinkOut(BacklinkBase):
    id: Any = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime