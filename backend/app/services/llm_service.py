import os
from pathlib import Path

from groq import Groq
from dotenv import load_dotenv

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
        question: str,
        context: str,
    ):

        prompt = f"""
You are an AI assistant for the DESIDOC AI Knowledge Library.

Answer ONLY from the provided context.

If the answer is not present in the context, say:

"I couldn't find the answer in the uploaded documents."

Context:

{context}

Question:

{question}
"""

        response = self.client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],

            temperature=0.2,
        )

        return response.choices[0].message.content