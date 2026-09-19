import os

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/"
)

client = MongoClient(MONGO_URI)

try:
    client.server_info()
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB connection failed:", e)

db = client["CodeTranslateAI"]

# Collections
users_collection = db["users"]
conversion_history_collection = db["conversion_history"]
saved_projects_collection = db["saved_projects"]