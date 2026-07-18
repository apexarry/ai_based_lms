import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


# Load .env file
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class LLMService:

    def __init__(self):

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise Exception("❌ GROQ_API_KEY not found!")

        self.client = Groq(api_key=api_key)

    def answer_question(
        self,
        prompt: str | None = None,
        messages: list | None = None,
    ):

        if messages is None:
            messages = [
                {"role": "system", "content": "You are an expert research assistant."},
                {"role": "user", "content": prompt or ""},
            ]

        response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
        )

        return response.choices[0].message.content