import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from openai import OpenAI

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from database import (
    users_collection,
    conversion_history_collection,
    saved_projects_collection
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

app = FastAPI()

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    return payload


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not configured")

client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------
# CORS
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------
# Request models
# ---------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TranslationRequest(BaseModel):
    source_code: str
    source_language: str
    target_language: str

class ExplainRequest(BaseModel):
    code: str
    language: str

class DebugRequest(BaseModel):
    code: str
    language: str
    error_message: str = ""

class SavedProjectRequest(BaseModel):
    project_name: str
    language: str
    code: str

class OptimizeRequest(BaseModel):
    code: str
    language: str


class TestCasesRequest(BaseModel):
    code: str
    language: str

# ---------------------------------
# Home / health check
# ---------------------------------

@app.get("/")
def home():

    return {
        "message": "CodeTranslateAI Backend is running",
        "database": "MongoDB connected"
    }


# ---------------------------------
# Register
# ---------------------------------

@app.post("/register")
def register_user(request: RegisterRequest):

    existing_user = users_collection.find_one({
        "email": request.email
    })

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(request.password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    hashed_password = hash_password(
        request.password
    )

    user = {
        "name": request.name,
        "email": request.email,
        "password": hashed_password
    }

    result = users_collection.insert_one(user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "name": request.name,
        "email": request.email
    }


# ---------------------------------
# Login
# ---------------------------------

@app.post("/login")
def login_user(request: LoginRequest):

    user = users_collection.find_one({
        "email": request.email
    })

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_is_valid = verify_password(
        request.password,
        user["password"]
    )

    if not password_is_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "sub": user["email"],
        "name": user["name"]
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }


# ---------------------------------
# Translation endpoint
# ---------------------------------

@app.post("/translate")
def translate_code(
    request: TranslationRequest,
    current_user: dict = Depends(get_current_user)
):

    prompt = f"""
Convert the following code from {request.source_language}
to {request.target_language}.

Requirements:
1. Return only the converted code.
2. Do not include Markdown code fences.
3. Do not include explanations.
4. Preserve the original functionality.
5. Use proper syntax and conventions for the target language.

Source language:
{request.source_language}

Target language:
{request.target_language}

Source code:
{request.source_code}
"""

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                "You are an expert programming language conversion assistant. "
                "Convert source code accurately between programming languages."
            ),
            input=prompt
        )

        converted_code = response.output_text.strip()

        conversion_record = {
            "user_email": current_user.get("sub"),
            "source_language": request.source_language,
            "target_language": request.target_language,
            "source_code": request.source_code,
            "converted_code": converted_code,
            "created_at": datetime.now(timezone.utc)
        }

        conversion_history_collection.insert_one(
            conversion_record
        )

        return {
            "message": "Code converted successfully",
            "source_language": request.source_language,
            "target_language": request.target_language,
            "source_code": request.source_code,
            "converted_code": converted_code,
            "user": current_user.get("sub")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI conversion failed: {str(e)}"
        )
# ---------------------------------
# Code Explanation endpoint
# ---------------------------------
@app.post("/explain")
def explain_code(
    request: ExplainRequest,
    current_user: dict = Depends(get_current_user)
):
    prompt = f"""
Analyze the following {request.language} code.

Return ONLY a valid JSON object.
Do not use Markdown.
Do not use ``` code fences.
Do not add any text before or after the JSON.

The JSON must have exactly these five keys:

{{
  "what_the_code_does": "Simple overall explanation",
  "step_by_step": "Detailed step-by-step explanation",
  "important_concepts": "Important programming concepts used",
  "expected_output": "Expected program output",
  "possible_improvements": "Useful improvements or best practices"
}}

Rules:
- Explain the code in simple student-friendly language.
- Be accurate to the selected programming language.
- Do not modify or rewrite the original code.
- For step_by_step, use numbered steps inside the string.
- For important_concepts, clearly mention important variables, keywords,
  functions, operators, and syntax.
- For expected_output, show the actual expected output if applicable.
- If there is no output, explain that.
- For possible_improvements, mention useful improvements.
- If no major improvement is required, say so.

Programming language:
{request.language}

Code:
{request.code}
"""

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                "You are an expert programming teacher. "
                "Return only valid JSON exactly matching the requested structure."
            ),
            input=prompt
        )

        result = response.output_text.strip()

        # Remove accidental Markdown code fences if the AI adds them
        if result.startswith("```"):
            lines = result.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            result = "\n".join(lines).strip()

        import json

        try:
            explanation = json.loads(result)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="AI returned an invalid explanation format."
            )

        required_fields = [
            "what_the_code_does",
            "step_by_step",
            "important_concepts",
            "expected_output",
            "possible_improvements"
        ]

        for field in required_fields:
            if field not in explanation:
                explanation[field] = "No information available."

        return {
            "message": "Code explained successfully",
            "language": request.language,
            "code": request.code,
            "explanation": explanation,
            "user": current_user.get("sub")
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI explanation failed: {str(e)}"
        )

# ---------------------------------
# AI Debugger endpoint
# ---------------------------------

@app.post("/debug")
def debug_code(
    request: DebugRequest,
    current_user: dict = Depends(get_current_user)
):
    prompt = f"""
Debug the following {request.language} code.

Analyze the code carefully and identify any programming errors.

Requirements:
1. Identify the error clearly.
2. Explain why the error occurs.
3. Provide the corrected code.
4. Provide a simple suggested solution.
5. Preserve the original purpose and functionality of the program.
6. If an error message is provided, use it as additional information.
7. Return the answer in the following format:

ERROR_DETECTED:
<error>

EXPLANATION:
<explanation>

CORRECTED_CODE:
<corrected code only>

SOLUTION:
<solution>

Programming language:
{request.language}

Error message:
{request.error_message}

Code:
{request.code}
"""

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                "You are an expert programming debugger. "
                "Find programming errors accurately, explain them "
                "clearly, and provide corrected code."
            ),
            input=prompt
        )

        result = response.output_text.strip()

        error_detected = ""
        explanation = ""
        corrected_code = ""
        solution = ""

        if "ERROR_DETECTED:" in result:
            error_detected = result.split(
                "ERROR_DETECTED:", 1
            )[1].split(
                "EXPLANATION:", 1
            )[0].strip()

        if "EXPLANATION:" in result:
            explanation = result.split(
                "EXPLANATION:", 1
            )[1].split(
                "CORRECTED_CODE:", 1
            )[0].strip()

        if "CORRECTED_CODE:" in result:
            corrected_code = result.split(
                "CORRECTED_CODE:", 1
            )[1].split(
                "SOLUTION:", 1
            )[0].strip()

            # Remove Markdown code fences
            corrected_code = corrected_code.replace("```php", "")
            corrected_code = corrected_code.replace("```PHP", "")
            corrected_code = corrected_code.replace("```", "")

            # Remove triple single-quote wrappers
            corrected_code = corrected_code.replace("'''php", "")
            corrected_code = corrected_code.replace("'''PHP", "")
            corrected_code = corrected_code.replace("'''", "")

            corrected_code = corrected_code.strip()

        if "SOLUTION:" in result:
            solution = result.split(
                "SOLUTION:", 1
            )[1].strip()

        return {
            "message": "Code debugged successfully",
            "language": request.language,
            "error_detected": error_detected,
            "explanation": explanation,
            "corrected_code": corrected_code,
            "solution": solution,
            "user": current_user.get("sub")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI debugging failed: {str(e)}"
        )

# ================================
# OPTIMIZE CODE
# ================================
@app.post("/optimize")
def optimize_code(
    request: OptimizeRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code is required"
        )

    prompt = f"""
You are an expert programming assistant.

Optimize the following {request.language} code.

Requirements:
1. Return the optimized code.
2. Improve readability and efficiency.
3. Do not unnecessarily change the functionality.
4. Use appropriate best practices.
5. Briefly explain what was improved.

Code:

{request.code}
"""

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt
        )

        result = response.output_text

        return {
            "optimized_code": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI optimization failed: {str(e)}"
        )


# ================================
# GENERATE TEST CASES
# ================================
@app.post("/test-cases")
def generate_test_cases(
    request: TestCasesRequest,
    current_user: dict = Depends(get_current_user)
):
    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code is required"
        )

    prompt = f"""
You are an expert software testing assistant.

Generate test cases for the following {request.language} code.

Requirements:
1. Generate multiple useful test cases.
2. Include normal/valid cases.
3. Include edge cases.
4. Include invalid cases where applicable.
5. Provide expected results.
6. Return executable or easy-to-understand test code where appropriate.

Code:

{request.code}
"""

    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            input=prompt
        )

        result = response.output_text

        return {
            "test_cases": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI test case generation failed: {str(e)}"
        )
    
# ---------------------------------
# Conversion History endpoint
# ---------------------------------

@app.get("/history")
def get_conversion_history(
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("sub")

    history = list(
        conversion_history_collection.find(
            {"user_email": user_email}
        ).sort("created_at", -1)
    )

    for record in history:
        record["_id"] = str(record["_id"])
        record["created_at"] = record["created_at"].isoformat()

    return {
        "message": "Conversion history fetched successfully",
        "history": history
    }

# ---------------------------------
# Saved Projects endpoint
# ---------------------------------

@app.post("/projects")
def save_project(
    request: SavedProjectRequest,
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("sub")

    if not request.project_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Project name is required"
        )

    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Project code is required"
        )

    project = {
        "user_email": user_email,
        "project_name": request.project_name.strip(),
        "language": request.language,
        "code": request.code,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = saved_projects_collection.insert_one(project)

    return {
        "message": "Project saved successfully",
        "project_id": str(result.inserted_id),
        "project": {
            "id": str(result.inserted_id),
            "project_name": project["project_name"],
            "language": project["language"],
            "code": project["code"],
            "created_at": project["created_at"].isoformat(),
            "updated_at": project["updated_at"].isoformat()
        }
    }

# ---------------------------------
# Get Saved Projects
# ---------------------------------

@app.get("/projects")
def get_saved_projects(
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("sub")

    projects = list(
        saved_projects_collection.find(
            {"user_email": user_email}
        ).sort("updated_at", -1)
    )

    for project in projects:
        project["id"] = str(project["_id"])
        del project["_id"]

        project["created_at"] = project["created_at"].isoformat()
        project["updated_at"] = project["updated_at"].isoformat()

        # Do not send the user's email to the frontend
        project.pop("user_email", None)

    return {
        "message": "Saved projects fetched successfully",
        "projects": projects
    }


# ---------------------------------
# Update Saved Project
# ---------------------------------

@app.put("/projects/{project_id}")
def update_saved_project(
    project_id: str,
    request: SavedProjectRequest,
    current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId

    user_email = current_user.get("sub")

    if not request.project_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Project name is required"
        )

    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Project code is required"
        )

    try:
        object_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid project ID"
        )

    result = saved_projects_collection.update_one(
        {
            "_id": object_id,
            "user_email": user_email
        },
        {
            "$set": {
                "project_name": request.project_name.strip(),
                "language": request.language,
                "code": request.code,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    updated_project = saved_projects_collection.find_one({
        "_id": object_id,
        "user_email": user_email
    })

    updated_project["id"] = str(updated_project["_id"])
    del updated_project["_id"]
    updated_project.pop("user_email", None)

    updated_project["created_at"] = updated_project[
        "created_at"
    ].isoformat()

    updated_project["updated_at"] = updated_project[
        "updated_at"
    ].isoformat()

    return {
        "message": "Project updated successfully",
        "project": updated_project
    }


# ---------------------------------
# Delete Saved Project
# ---------------------------------

@app.delete("/projects/{project_id}")
def delete_saved_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId

    user_email = current_user.get("sub")

    try:
        object_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid project ID"
        )

    result = saved_projects_collection.delete_one(
        {
            "_id": object_id,
            "user_email": user_email
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "message": "Project deleted successfully",
        "project_id": project_id
    }

# ---------------------------------
# Dashboard Stats endpoint
# ---------------------------------

@app.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("sub")

    total_conversions = conversion_history_collection.count_documents({
        "user_email": user_email
    })

    saved_projects = saved_projects_collection.count_documents({
        "user_email": user_email
    })

    return {
        "total_conversions": total_conversions,
        "saved_projects": saved_projects,
        "successful_conversions": total_conversions,
        "ai_requests": total_conversions
    }