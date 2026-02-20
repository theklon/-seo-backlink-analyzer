from .database import db

users_collection = db["users"]
projects_collection = db["projects"]
categories_collection = db["categories"]
backlinks_collection = db["backlinks"]
project_media_collection = db["project_media"]
tools_collection = db["tools"]   # NEW
placements_collection = db["placements"]