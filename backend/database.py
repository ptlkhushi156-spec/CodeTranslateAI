from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"

client = MongoClient(MONGO_URI)

try:
    client.server_info()
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB connection failed:", e)

db = client["CodeTranslateAI"]