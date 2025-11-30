import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Try to get key from env, fallback to the one seen in screenshot if needed for debugging
api_key = os.getenv("VITE_GEMINI_API_KEY") or "AIzaSyC0Z1PocLT8um1Pt2ybOHW175-tmYp-uuM"

genai.configure(api_key=api_key)

print(f"Checking models for key: {api_key[:10]}...")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
