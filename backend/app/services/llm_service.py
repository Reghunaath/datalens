import os

from dotenv import load_dotenv
from google import genai

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
_MODEL = "gemini-3.1-pro-preview"


def generate_code(prompt: str) -> str:
    """Send a prompt to Gemini and return the generated Python code string."""
    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    code = response.text.strip()

    # Strip markdown code fences if the model wraps the output
    if code.startswith("```"):
        lines = code.split("\n")
        lines = [line for line in lines if not line.strip().startswith("```")]
        code = "\n".join(lines)

    return code.strip()
