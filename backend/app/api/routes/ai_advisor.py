
import logging

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings

router = APIRouter(prefix="/advisor")
logger = logging.getLogger(__name__)


class AdvisorRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


class AdvisorResponse(BaseModel):
    answer: str


@router.post("/ask", response_model=AdvisorResponse)
async def ask_advisor(data: AdvisorRequest):
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Groq API key is not configured"
        )

    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = {
        "model": "openai/gpt-oss-20b",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are AGROVERSE AI, a helpful agricultural "
                    "advisor for farmers. Answer in the same language "
                    "as the user's question, including Bengali. "
                    "Give practical advice about crops, soil, "
                    "irrigation, fertilizers and farming. "
                    "Do not invent local weather, soil test results "
                    "or NASA data. Explain uncertainty when needed. "
                    "For pesticide use, recommend following local "
                    "agricultural guidelines and product labels."
                ),
            },
            {
                "role": "user",
                "content": data.question,
            },
        ],
        "max_completion_tokens": 4096,
        "temperature": 0.5,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()

        result = response.json()
        choices = result.get("choices", [])

        if not choices:
            raise HTTPException(
                status_code=502,
                detail="AI did not return an answer"
            )

        answer = (
            choices[0].get("message", {}).get("content") or ""
        ).strip()

        if not answer:
            raise HTTPException(
                status_code=502,
                detail="AI returned an empty answer"
            )

        return AdvisorResponse(answer=answer)

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Groq AI service timed out"
        )

    except httpx.HTTPStatusError as exc:
        logger.warning(
            "Groq API failed: status=%s, response=%s",
            exc.response.status_code,
            exc.response.text[:1000],
        )
        raise HTTPException(
            status_code=502,
            detail="Groq AI request failed. Check model access, key or quota."
        )

    except httpx.RequestError:
        logger.exception("Groq API connection failed")
        raise HTTPException(
            status_code=502,
            detail="Could not connect to Groq AI"
        )
