"""
CIP ML Platform - Main FastAPI Application
All ML modules exposed as REST APIs.
"""
import base64
import json
import os
import sys
import time
from typing import Optional

from dotenv import load_dotenv
load_dotenv()  # Load .env file (GEMINI_API_KEY, ELEVENLABS_API_KEY, etc.)

import httpx
import uvicorn
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.models import (  # noqa: E402
    CareerReadinessRequest,
    CareerReadinessResponse,
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
    InterviewQuestionRequest,
    InterviewQuestionResponse,
    RecommendRequest,
    RecommendResponse,
    ResumeAnalyzeRequest,
    ResumeAnalyzeResponse,
)
from services.career_readiness.engine import compute_readiness, recommend_jobs  # noqa: E402
from services.interview_evaluator.engine import evaluate_interview  # noqa: E402
from services.resume_analyzer.engine import analyze_resume  # noqa: E402
from services.embeddings_service import generate_embedding, calculate_similarity, batch_generate_embeddings  # noqa: E402
from services.resume_rag_service import parse_resume_with_rag, get_resume_context, generate_resume_embeddings  # noqa: E402

try:
    import google.generativeai as genai  # type: ignore
except Exception:
    genai = None


ROLE_TOPICS = {
    "frontend": ["React", "JavaScript", "Browser APIs", "Performance", "CSS"],
    "backend": ["System Design", "Database", "API Design", "Concurrency", "Caching"],
    "devops": ["Docker", "Kubernetes", "CI/CD", "Cloud", "Observability"],
    "data": ["SQL", "Python", "Statistics", "Data Modeling", "ETL"],
    "sde": ["DSA", "OOP", "System Design", "Database", "OS"],
    "software": ["DSA", "OOP", "System Design", "Database", "OS"],
}

ROLE_QUESTION_BANK = {
    "frontend": [
        {"topic": "React", "difficulty": "medium", "question": "How would you structure a large React screen so state, rendering, and data fetching stay maintainable?"},
        {"topic": "JavaScript", "difficulty": "easy", "question": "Explain closures with a practical bug or interview example."},
        {"topic": "Performance", "difficulty": "medium", "question": "What would you check first if a React page becomes sluggish after adding more components?"},
        {"topic": "Browser APIs", "difficulty": "medium", "question": "How does the event loop affect UI responsiveness in a browser app?"},
    ],
    "backend": [
        {"topic": "System Design", "difficulty": "hard", "question": "Design a scalable interview evaluation service that accepts answers, evaluates them, and stores results."},
        {"topic": "Database", "difficulty": "medium", "question": "How do you choose indexes for a write-heavy application without hurting performance too much?"},
        {"topic": "API Design", "difficulty": "medium", "question": "Design an API for submitting interview answers and returning structured feedback."},
        {"topic": "Caching", "difficulty": "medium", "question": "Where would you cache data in a job recommendation platform, and how would you handle stale results?"},
    ],
    "devops": [
        {"topic": "Docker", "difficulty": "easy", "question": "How would you containerize a multi-service application for local development?"},
        {"topic": "Kubernetes", "difficulty": "hard", "question": "How would you roll out a new backend service version with near-zero downtime?"},
        {"topic": "CI/CD", "difficulty": "medium", "question": "What checks must run before deploying an interview platform to production?"},
        {"topic": "Observability", "difficulty": "medium", "question": "How would you debug intermittent failures across frontend, backend, Kafka, and ML services?"},
    ],
    "data": [
        {"topic": "SQL", "difficulty": "medium", "question": "How would you rank candidates against jobs using skill overlap in SQL?"},
        {"topic": "Python", "difficulty": "easy", "question": "How would you structure a Python service for resume parsing and inference?"},
        {"topic": "Data Modeling", "difficulty": "medium", "question": "How would you model students, resumes, interviews, and jobs for analytics and matching?"},
        {"topic": "Statistics", "difficulty": "medium", "question": "What metrics would you use to decide whether interview scores are actually improving?"},
    ],
    "sde": [
        {"topic": "DSA", "difficulty": "easy", "question": "When would you choose a hash map, heap, or balanced tree? Compare time and space tradeoffs."},
        {"topic": "OOP", "difficulty": "medium", "question": "How would you model an interview platform using classes, interfaces, and separation of concerns?"},
        {"topic": "System Design", "difficulty": "hard", "question": "Design a resume-aware AI interview coach that supports voice input and structured feedback."},
        {"topic": "Database", "difficulty": "medium", "question": "How would you store interview attempts and still query progress trends efficiently?"},
        {"topic": "OS", "difficulty": "medium", "question": "Explain process vs thread, and give one production issue where the distinction matters."},
    ],
}


GOVERNMENT_QUESTION_BANK = {
    "ssb": [
        {"topic": "Leadership", "difficulty": "medium", "question": "Describe a time you had to motivate a demoralized team to complete a task."},
        {"topic": "Situation Reaction", "difficulty": "hard", "question": "Two of your teammates are arguing loudly during an exercise. What do you do?"},
        {"topic": "Self Confidence", "difficulty": "medium", "question": "What would you do if you were blamed for a mistake you didn't make?"},
    ],
    "upsc": [
        {"topic": "Governance", "difficulty": "hard", "question": "How would you handle a situation where local political pressure conflicts with administrative rules?"},
        {"topic": "Current Affairs", "difficulty": "medium", "question": "What recent policy change do you think will have the biggest impact on your home state?"},
        {"topic": "Ethics", "difficulty": "medium", "question": "How would you respond if a senior colleague asked you to overlook a minor procedural violation?"},
    ],
    "bank_po": [
        {"topic": "Banking Awareness", "difficulty": "medium", "question": "What is the difference between a scheduled and non-scheduled bank?"},
        {"topic": "Financial Literacy", "difficulty": "medium", "question": "How would you explain the benefits of a fixed deposit to a first-time customer?"},
        {"topic": "Current Affairs", "difficulty": "hard", "question": "How do changes in the repo rate typically affect EMI amounts for existing loan customers?"},
    ],
    "ssc_railway": [
        {"topic": "General Awareness", "difficulty": "medium", "question": "What do you know about the organizational structure of the department you are applying to?"},
        {"topic": "Work Approach", "difficulty": "medium", "question": "How would you handle a backlog of pending applications in your role?"},
        {"topic": "Technical", "difficulty": "hard", "question": "What basic safety checks would you perform before starting work on site?"},
    ],
    "research_org": [
        {"topic": "Technical", "difficulty": "hard", "question": "How would you debug a simulation that produces inconsistent results across runs?"},
        {"topic": "Research Aptitude", "difficulty": "medium", "question": "How do you decide whether a research approach is worth pursuing further or should be abandoned?"},
        {"topic": "Project Deep-Dive", "difficulty": "hard", "question": "What is the most technically difficult part of a project you've worked on, and how did you solve it?"},
    ],
}


def _government_fallback_question(persona_mode: str, previous_answers: list) -> dict:
    bank = GOVERNMENT_QUESTION_BANK[persona_mode]
    item = bank[len(previous_answers) % len(bank)]
    return {
        "question": item["question"],
        "difficulty": item["difficulty"],
        "topic": item["topic"],
        "expected_answer": f"Look for depth and genuineness in how the candidate addresses {item['topic'].lower()}.",
    }


def _get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or genai is None:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-flash"))


def _json_from_response(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        cleaned = cleaned.rsplit("```", 1)[0]
    return json.loads(cleaned)


def _normalize_skills(resume_data: dict) -> list[str]:
    skills = resume_data.get("skills") or resume_data.get("skill_details") or []
    if skills and isinstance(skills[0], dict):
        return [str(item.get("name", "")).strip() for item in skills if str(item.get("name", "")).strip()]
    return [str(item).strip() for item in skills if str(item).strip()]


def _role_key(job_role: str) -> str:
    normalized = (job_role or "sde").lower()
    return next((key for key in ROLE_TOPICS if key in normalized), "sde")


def _weak_topics(previous_answers: list) -> list[str]:
    topics: list[str] = []
    for item in previous_answers[-3:]:
        accuracy = getattr(item, "accuracy", None)
        topic = getattr(item, "topic", None)
        if accuracy is not None and accuracy < 65 and topic:
            topics.append(topic)
    return topics


def _persona_instruction(persona_mode: str) -> str:
    persona = (persona_mode or "friendly").lower()
    if persona == "strict":
        return "Tone: strict, concise, demanding, and professional."
    if persona == "faang":
        return "Tone: FAANG-level technical interviewer. Prioritize correctness, edge cases, complexity, tradeoffs, and scale."
    # Government exam interview personas (Module 2: SSB/UPSC/Bank PO/SSC-Railway/Research Org)
    if persona == "ssb":
        return ("Tone: senior army officer conducting an SSB interview. Ask questions that test "
                "leadership, patriotism, situational awareness, and officer-like qualities. Give "
                "feedback in a direct, military-style manner focused on decisiveness and integrity.")
    if persona == "upsc":
        return ("Tone: UPSC civil services board member. Ask questions probing governance, policy "
                "reasoning, ethics, and awareness of the candidate's home state/background. Give "
                "balanced, formal feedback focused on clarity of thought and administrative judgment.")
    if persona == "bank_po":
        return ("Tone: bank PO panel interviewer. Ask questions on banking awareness, RBI policy, "
                "financial literacy, and motivation for a banking career. Give practical feedback "
                "focused on financial-sector awareness and customer-facing judgment.")
    if persona == "ssc_railway":
        return ("Tone: SSC/Railway recruitment board member. Ask questions on general awareness, "
                "current affairs, and department-specific knowledge (technical for JE roles). Give "
                "feedback focused on breadth of general awareness and procedural discipline.")
    if persona == "research_org":
        return ("Tone: senior scientist at a defence/research organisation (DRDO/ISRO/NIC). Ask "
                "deep technical and research-aptitude questions, harder than a typical FAANG interview. "
                "Give feedback focused on technical rigor, research aptitude, and precision.")
    return "Tone: friendly, concise, supportive, and direct."


def _fallback_question(resume_data: dict, job_role: str, previous_answers: list) -> dict:
    skills = _normalize_skills(resume_data)
    role_key = _role_key(job_role)
    role_topics = ROLE_TOPICS[role_key]
    weak_topics = _weak_topics(previous_answers)
    asked_topics = {getattr(item, "topic", None) for item in previous_answers if getattr(item, "topic", None)}
    role_bank = ROLE_QUESTION_BANK.get(role_key, ROLE_QUESTION_BANK["sde"])

    preferred_bank = [
        item for item in role_bank
        if item["topic"] in weak_topics or item["topic"] not in asked_topics
    ] or role_bank
    selected_bank_item = preferred_bank[len(previous_answers) % len(preferred_bank)]

    topic_pool = weak_topics + [
        topic for topic in role_topics
        if topic.lower() not in {skill.lower() for skill in skills} or topic not in asked_topics
    ] + role_topics
    topic = topic_pool[len(previous_answers) % len(topic_pool)]

    difficulty = "easy"
    if len(previous_answers) >= 2:
        recent = [item.accuracy for item in previous_answers[-2:] if getattr(item, "accuracy", None) is not None]
        average = sum(recent) / len(recent) if recent else 70
        difficulty = "hard" if average >= 78 else "medium" if average >= 55 else "easy"

    skill_context = ", ".join(skills[:5]) or "recent projects"
    templates = {
        "DSA": f"For a {job_role} interview, explain when you would choose a hash map, heap, or balanced tree. Include time and space tradeoffs.",
        "System Design": f"Design a small scalable service relevant to a {job_role}. Cover API, storage, caching, failures, and one bottleneck.",
        "Database": "How would you design indexes and transactions so a SQL-backed feature stays fast without breaking consistency?",
        "OOP": f"Describe how you would model a project from your resume using classes, interfaces, and encapsulation. What would you avoid?",
        "OS": "Explain process vs thread and connect it to a concurrency bug you might hit in production.",
        "React": f"Based on your skills in {skill_context}, how would you prevent unnecessary renders and keep a complex React page maintainable?",
        "JavaScript": "Explain closures and the event loop, then describe one real bug each can cause.",
        "API Design": "Design an API for submitting and evaluating interview answers. Include payload shape, validation, and error handling.",
        "Caching": "Where would you add caching in a job matching system, and how would you avoid stale results?",
        "Docker": "How would you containerize this application for local development and production?",
        "Kubernetes": "How would you roll out a new interview service version with zero downtime?",
        "SQL": "How would you rank candidates whose skills overlap best with a job's required skills?",
        "Python": "How would you structure a Python service that extracts resume skills and serves them to other services?",
    }
    question = templates.get(topic, selected_bank_item["question"])
    if skills:
        question = f"{question} Connect your answer to the candidate's background in {skill_context} when relevant."
    expected_answer = (
        f"A strong answer should define {topic}, connect it to {job_role}, discuss tradeoffs, "
        "include a concrete example, and mention complexity or edge cases where relevant."
    )
    return {
        "question": question,
        "difficulty": difficulty,
        "topic": topic,
        "expected_answer": expected_answer,
    }


def _generate_question(resume_data: dict, job_role: str, previous_answers: list, persona_mode: str) -> dict:
    is_government_persona = (persona_mode or "").lower() in GOVERNMENT_QUESTION_BANK
    fallback = (
        _government_fallback_question((persona_mode or "").lower(), previous_answers)
        if is_government_persona
        else _fallback_question(resume_data, job_role, previous_answers)
    )
    model = _get_gemini_model()
    if model is None:
        return fallback

    skills = _normalize_skills(resume_data)
    seed_bank = GOVERNMENT_QUESTION_BANK[(persona_mode or "").lower()] if is_government_persona \
        else ROLE_QUESTION_BANK.get(_role_key(job_role), ROLE_QUESTION_BANK["sde"])
    seed_questions = [
        f"- [{item['difficulty']}] {item['topic']}: {item['question']}"
        for item in seed_bank[:6]
    ]
    context_line = (
        f"Government Exam Type: {persona_mode.upper()}" if is_government_persona
        else f"Role: {job_role}\nResume Skills: {', '.join(skills[:10]) or 'general programming'}"
    )
    prompt = f"""You are generating the next interview question.
{_persona_instruction(persona_mode)}

{context_line}
Weak Topics From Last 3 Answers: {", ".join(_weak_topics(previous_answers)) or "none"}
Questions Already Asked: {len(previous_answers)}
Seed Question Bank:
{chr(10).join(seed_questions)}

Return JSON only:
{{
  "question": "string",
  "difficulty": "easy|medium|hard",
  "topic": "string",
  "expected_answer": "short structured outline"
}}

Constraints:
- One question only
- Technical and realistic
- Start from the role question bank, then refine it using the resume context
- Use resume context when relevant
- Prefer repeated weak areas
- Answerable in under 2 minutes
"""
    try:
        response = model.generate_content(prompt)
        payload = _json_from_response(response.text)
        if not all(key in payload for key in ["question", "difficulty", "topic"]):
            return fallback
        if "expected_answer" not in payload:
            payload["expected_answer"] = fallback["expected_answer"]
        return payload
    except Exception:
        return fallback


def _heuristic_feedback(question: str, answer: str, expected_answer: str, topic: str) -> dict:
    base = evaluate_interview({
        "student_id": "realtime",
        "question": question,
        "answer_text": answer,
        "expected_answer": expected_answer,
        "domain": topic,
        "difficulty": "Medium",
        "audio_features": None,
    })
    return {
        "score": round(base["overall_score"]),
        "good": "; ".join(base["strengths"][:2]) or "You answered directly.",
        "missing": "; ".join(base["key_concepts_missing"][:3]) or "Add deeper tradeoffs or edge cases.",
        "ideal": base["model_answer_hint"],
        "tip": base["improvements"][0] if base["improvements"] else "Use a clearer structure: definition, approach, tradeoff, example.",
    }


def _evaluate_with_gemini(question: str, answer: str, skills: list[str], persona_mode: str) -> Optional[dict]:
    model = _get_gemini_model()
    if model is None:
        return None

    prompt = f"""You are a strict technical interviewer.
{_persona_instruction(persona_mode)}

Evaluate this answer.

Question: {question}
Answer: {answer}
Skills: {", ".join(skills[:12]) or "unknown"}

Return JSON only:
{{
  "score": 72,
  "good": "short string",
  "missing": "short string",
  "ideal": "short structured answer",
  "tip": "short string"
}}

Keep it short and actionable.
"""
    try:
        response = model.generate_content(prompt)
        payload = _json_from_response(response.text)
        if not all(key in payload for key in ["score", "good", "missing", "ideal", "tip"]):
            return None
        return payload
    except Exception:
        return None


async def _tts_with_elevenlabs(text: str, persona_mode: str) -> Optional[dict]:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")
    if not api_key or not voice_id:
        return None

    voice_settings = {
        "strict": {"stability": 0.45, "similarity_boost": 0.75},
        "faang": {"stability": 0.35, "similarity_boost": 0.8},
        "friendly": {"stability": 0.65, "similarity_boost": 0.75},
    }.get((persona_mode or "friendly").lower(), {"stability": 0.6, "similarity_boost": 0.75})

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": api_key,
                "accept": "audio/mpeg",
                "content-type": "application/json",
            },
            json={
                "text": text,
                "model_id": os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"),
                "voice_settings": voice_settings,
            },
        )
        response.raise_for_status()
        return {
            "provider": "elevenlabs",
            "mime_type": "audio/mpeg",
            "audio_base64": base64.b64encode(response.content).decode("ascii"),
        }


# Kafka Producer (optional, graceful degradation)
try:
    from kafka import KafkaProducer
    import json as _json

    _producer = KafkaProducer(
        bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        value_serializer=lambda value: _json.dumps(value).encode("utf-8"),
        api_version=(0, 10, 2),
        request_timeout_ms=5000,
    )
    KAFKA_ENABLED = True
except Exception:
    _producer = None
    KAFKA_ENABLED = False


def publish_event(topic: str, data: dict):
    if KAFKA_ENABLED and _producer:
        try:
            _producer.send(topic, value=data)
            _producer.flush(timeout=1)
        except Exception as exc:
            print(f"[Kafka] Failed to publish to {topic}: {exc}")


app = FastAPI(
    title="CIP ML Platform",
    description="Career Intelligence Platform - AI/ML Intelligence Layer",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "CIP ML Platform",
        "version": "1.0.0",
        "status": "operational",
        "kafka_enabled": KAFKA_ENABLED,
        "gemini_enabled": _get_gemini_model() is not None,
        "endpoints": [
            "POST /ml/resume/analyze",
            "POST /ml/resume/rag-parse",
            "POST /ml/resume/context",
            "POST /ml/resume/embeddings",
            "POST /ml/embeddings/generate",
            "POST /ml/similarity/calculate",
            "POST /ml/interview/question",
            "POST /ml/interview/evaluate",
            "POST /ml/interview/coach",
            "POST /ml/readiness",
            "POST /ml/recommend",
            "POST /ml/certificate/validate",
        ],
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "modules": {
            "resume_analyzer": "active",
            "interview_evaluator": "active",
            "career_readiness": "active",
            "recommendation_engine": "active",
            "certificate_validator": "active",
            "embeddings_service": "active",
            "resume_rag_service": "active",
        },
        "kafka": "connected" if KAFKA_ENABLED else "disconnected (offline mode)",
        "gemini": "configured" if _get_gemini_model() is not None else "not configured",
    }


# ============================================================================
# PHASE 1: SEMANTIC SIMILARITY ENDPOINTS
# ============================================================================

@app.post("/ml/embeddings/generate", tags=["Embeddings"])
async def generate_embedding_endpoint(payload: dict):
    """
    Generate embedding vector for input text
    
    Request:
    {
        "text": "Machine learning is awesome"
    }
    
    Response:
    {
        "embedding": [0.123, -0.456, ...],
        "dimension": 384,
        "model": "sentence-transformers/all-MiniLM-L6-v2"
    }
    """
    try:
        text = payload.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        result = generate_embedding(text)
        return JSONResponse(content=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {e}")


@app.post("/ml/similarity/calculate", tags=["Embeddings"])
async def calculate_similarity_endpoint(payload: dict):
    """
    Calculate semantic similarity between two texts
    
    Request:
    {
        "text1": "Machine learning is a subset of AI",
        "text2": "ML is part of artificial intelligence"
    }
    
    Response:
    {
        "similarity": 0.85,
        "score": 85.0,
        "method": "cosine",
        "model": "sentence-transformers/all-MiniLM-L6-v2"
    }
    """
    try:
        text1 = payload.get("text1", "")
        text2 = payload.get("text2", "")
        
        if not text1 or not text2:
            raise HTTPException(status_code=400, detail="Both text1 and text2 are required")
        
        result = calculate_similarity(text1, text2)
        return JSONResponse(content=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {e}")


@app.post("/ml/embeddings/batch", tags=["Embeddings"])
async def batch_generate_embeddings_endpoint(payload: dict):
    """
    Generate embeddings for multiple texts in batch
    
    Request:
    {
        "texts": ["text1", "text2", "text3"]
    }
    
    Response:
    {
        "embeddings": [[...], [...], [...]],
        "dimension": 384,
        "count": 3,
        "model": "sentence-transformers/all-MiniLM-L6-v2"
    }
    """
    try:
        texts = payload.get("texts", [])
        if not texts:
            raise HTTPException(status_code=400, detail="Texts list is required")
        
        result = batch_generate_embeddings(texts)
        return JSONResponse(content=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch embedding generation failed: {e}")


# ============================================================================
# PHASE 2: RAG RESUME PARSING ENDPOINTS
# ============================================================================

@app.post("/ml/resume/rag-parse", tags=["Resume RAG"])
async def rag_parse_resume_endpoint(payload: dict):
    """
    Parse resume with RAG - extract structured data and generate embeddings
    
    Request:
    {
        "text": "Full resume text content...",
        "resume_id": "optional-resume-uuid"  // Optional: if provided, will use this ID
    }
    
    Response:
    {
        "resume_id": "resume-uuid-123",  // The ID used to store this resume
        "skills": ["Python", "Java", "Machine Learning"],
        "experience": [...],
        "projects": [...],
        "education": [...],
        "score": 85.0,
        "embeddings": {
            "skills": [0.1, 0.2, ...],
            "experience": [0.3, 0.4, ...]
        }
    }
    """
    try:
        text = payload.get("text", "")
        resume_id = payload.get("resume_id")  # Optional
        
        if not text:
            raise HTTPException(status_code=400, detail="Resume text is required")
        
        result = parse_resume_with_rag(text, resume_id)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG resume parsing failed: {e}")


@app.post("/ml/resume/context", tags=["Resume RAG"])
async def get_resume_context_endpoint(payload: dict):
    """
    Get relevant resume context using semantic search
    
    Request:
    {
        "resume_id": "resume-123",
        "query": "Java programming"
    }
    
    Response:
    {
        "context": "Candidate has 2 years of Java experience...",
        "relevance_score": 0.92
    }
    """
    try:
        resume_id = payload.get("resume_id", "")
        query = payload.get("query", "")
        
        if not resume_id or not query:
            raise HTTPException(status_code=400, detail="Both resume_id and query are required")
        
        result = get_resume_context(resume_id, query)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context retrieval failed: {e}")


@app.post("/ml/resume/embeddings", tags=["Resume RAG"])
async def generate_resume_embeddings_endpoint(payload: dict):
    """
    Generate embeddings for resume sections
    
    Request:
    {
        "sections": {
            "skills": "Python, Java, Machine Learning",
            "experience": "Software Engineer at Tech Corp...",
            "projects": "AI Chatbot using NLP..."
        }
    }
    
    Response:
    {
        "embeddings": {
            "skills": [0.1, 0.2, ...],
            "experience": [0.4, 0.5, ...],
            "projects": [0.7, 0.8, ...]
        }
    }
    """
    try:
        sections = payload.get("sections", {})
        if not sections:
            raise HTTPException(status_code=400, detail="Sections dictionary is required")
        
        result = generate_resume_embeddings(sections)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume embeddings generation failed: {e}")


# ============================================================================
# EXISTING ENDPOINTS (Resume, Interview, etc.)
# ============================================================================


@app.post("/ml/resume/analyze", response_model=ResumeAnalyzeResponse, tags=["Resume"])
async def analyze_resume_endpoint(request: ResumeAnalyzeRequest, background_tasks: BackgroundTasks):
    start = time.time()
    if not request.text:
        raise HTTPException(status_code=400, detail="Resume text is required")

    try:
        result = analyze_resume(
            text=request.text,
            student_id=request.student_id,
            job_role=request.job_role or "SDE",
        )
        background_tasks.add_task(
            publish_event,
            "score-events",
            {
                "event_type": "resume_analyzed",
                "student_id": request.student_id,
                "resume_score": result["resume_score"],
                "skills_count": len(result["skills"]),
                "timestamp": time.time(),
            },
        )
        result["processing_time_ms"] = round((time.time() - start) * 1000, 2)
        return JSONResponse(content=result)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


@app.post("/ml/resume/upload", tags=["Resume"])
async def upload_resume(student_id: str, job_role: str = "SDE", file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported")
    content = await file.read()
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read file content")
    result = analyze_resume(text=text, student_id=student_id, job_role=job_role)
    return JSONResponse(content=result)


@app.post("/ml/interview/question", response_model=InterviewQuestionResponse, tags=["Interview"])
async def next_interview_question(request: InterviewQuestionRequest):
    try:
        payload = _generate_question(
            resume_data=request.resume_data or {},
            job_role=request.job_role or "SDE",
            previous_answers=request.previous_answers or [],
            persona_mode=(request.resume_data or {}).get("persona_mode", "friendly"),
        )
        return JSONResponse(content=payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {exc}")


@app.post("/ml/interview/evaluate", response_model=InterviewEvaluateResponse, tags=["Interview"])
async def evaluate_interview_endpoint(request: InterviewEvaluateRequest, background_tasks: BackgroundTasks):
    try:
        result = evaluate_interview({
            "student_id": request.student_id,
            "question": request.question,
            "answer_text": request.answer_text,
            "expected_answer": request.expected_answer,
            "domain": request.domain,
            "difficulty": request.difficulty,
            "audio_features": request.audio_features,
        })
        background_tasks.add_task(
            publish_event,
            "score-events",
            {
                "event_type": "interview_evaluated",
                "student_id": request.student_id,
                "overall_score": result["overall_score"],
                "technical_score": result["technical_score"],
                "timestamp": time.time(),
            },
        )
        return JSONResponse(content=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")


@app.post("/ml/interview/coach", tags=["Interview"])
async def coach_interview_answer(payload: dict):
    """
    AI Interview Coach - provides feedback and answers questions
    Supports two modes:
    1. Answer evaluation mode: provide 'answer' to get feedback
    2. Chat mode: provide 'user_query' to ask questions
    """
    answer = str(payload.get("answer", "")).strip()
    question = str(payload.get("question", "")).strip()
    user_query = str(payload.get("user_query", "")).strip()
    job_role = str(payload.get("job_role", "SDE")).strip() or "SDE"
    persona_mode = str(payload.get("persona_mode", "friendly")).strip() or "friendly"
    resume_skills = [str(skill).strip() for skill in payload.get("resume_skills", []) if str(skill).strip()]
    expected_answer = str(payload.get("expected_answer", "")).strip() or f"A strong answer should connect the idea to {job_role}, mention tradeoffs, and give one example."
    topic = str(payload.get("topic", "DSA")).strip() or "DSA"

    # Mode 1: Chat mode - user asking a question
    if user_query:
        model = _get_gemini_model()
        if not model:
            return JSONResponse(content={"reply": "AI is currently offline. Please try again later."})
            
        prompt = f"""
        You are an expert, encouraging AI Interview Mentor.
        The user is practicing for a technical interview.
        
        Interview Question: "{question}"
        The user's original answer: "{answer if answer else 'Not provided yet'}"
        
        The user is asking you a follow-up question:
        "{user_query}"
        
        Provide a helpful, direct, and constructive response. Keep it conversational but concise (2-3 sentences max).
        """
        
        try:
            response = model.generate_content(prompt)
            reply = response.text.strip()
            return JSONResponse(content={"reply": reply})
        except Exception as e:
            return JSONResponse(content={"reply": "Sorry, I'm having trouble analyzing that right now. Could you rephrase your question?"})
    
    # Mode 2: Answer evaluation mode - evaluate user's answer
    if not answer or not question:
        raise HTTPException(status_code=400, detail="Both question and answer are required for evaluation mode, or provide user_query for chat mode")

    ai_feedback = _evaluate_with_gemini(question, answer, resume_skills, persona_mode)
    feedback = ai_feedback or _heuristic_feedback(question, answer, expected_answer, topic)

    speech_text = f"Score {feedback['score']}. Good: {feedback['good']}. Missing: {feedback['missing']}. Tip: {feedback['tip']}"
    audio = None
    try:
        audio = await _tts_with_elevenlabs(speech_text, persona_mode)
    except Exception:
        audio = None

    response = {
        "score": feedback["score"],
        "good": feedback["good"],
        "missing": feedback["missing"],
        "ideal": feedback["ideal"],
        "tip": feedback["tip"],
        "speech_text": speech_text,
        "audio": audio,
        "provider": audio["provider"] if audio else "browser",
    }
    return JSONResponse(content=response)

@app.post("/ml/readiness", response_model=CareerReadinessResponse, tags=["Career"])
async def career_readiness_endpoint(request: CareerReadinessRequest, background_tasks: BackgroundTasks):
    try:
        result = compute_readiness({
            "student_id": request.student_id,
            "resume_score": request.resume_score,
            "academic_score": request.academic_score,
            "interview_score": request.interview_score,
            "target_role": request.target_role or "SDE",
        })
        background_tasks.add_task(
            publish_event,
            "score-events",
            {
                "event_type": "readiness_computed",
                "student_id": request.student_id,
                "readiness_score": result["readiness_score"],
                "level": result["level"],
                "timestamp": time.time(),
            },
        )
        return JSONResponse(content=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Readiness computation failed: {exc}")


@app.post("/ml/recommend", response_model=RecommendResponse, tags=["Recommendation"])
async def recommend_endpoint(request: RecommendRequest, background_tasks: BackgroundTasks):
    try:
        result = recommend_jobs({
            "student_id": request.student_id,
            "student_skills": request.student_skills,
            "cgpa": request.cgpa,
            "readiness_score": request.readiness_score,
            "interests": request.interests or [],
            "preferred_domains": request.preferred_domains or [],
            "jobs": [job.dict() for job in request.jobs],
        })
        background_tasks.add_task(
            publish_event,
            "recommendation-events",
            {
                "event_type": "jobs_recommended",
                "student_id": request.student_id,
                "top_job_id": result["recommendations"][0]["job_id"] if result["recommendations"] else None,
                "count": len(result["recommendations"]),
                "timestamp": time.time(),
            },
        )
        return JSONResponse(content=result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}")


@app.post("/ml/certificate/validate", tags=["Certificate"])
async def validate_certificate_endpoint(
    certificate_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
):
    from services.certificate_validator.engine import validate_certificate_pipeline
    import shutil
    import tempfile

    start = time.time()
    if not file.filename.lower().endswith((".pdf", ".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG files supported")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name

        result = validate_certificate_pipeline(file_path=tmp_path, certificate_id=certificate_id)
        result["processing_time_ms"] = round((time.time() - start) * 1000, 2)

        if background_tasks:
            background_tasks.add_task(
                publish_event,
                "certificate-events",
                {
                    "event_type": "CERTIFICATE_VALIDATED",
                    "certificate_id": certificate_id,
                    "authenticity_score": result["authenticity_score"],
                    "status": result["status"],
                    "timestamp": time.time(),
                },
            )

        os.unlink(tmp_path)
        return JSONResponse(content=result)
    except Exception as exc:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=f"Validation failed: {exc}")


@app.post("/ml/batch/analyze", tags=["Batch"])
async def batch_analyze(requests: list):
    results = []
    for request in requests[:50]:
        request_type = request.get("type")
        data = request.get("data", {})
        try:
            if request_type == "resume":
                result = analyze_resume(**data)
            elif request_type == "interview":
                result = evaluate_interview(data)
            elif request_type == "readiness":
                result = compute_readiness(data)
            elif request_type == "recommend":
                result = recommend_jobs(data)
            else:
                result = {"error": f"Unknown type: {request_type}"}
            results.append({"type": request_type, "status": "success", "result": result})
        except Exception as exc:
            results.append({"type": request_type, "status": "error", "error": str(exc)})
    return {"batch_size": len(requests), "results": results}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
