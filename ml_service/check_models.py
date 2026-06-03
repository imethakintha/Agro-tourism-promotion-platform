import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../server/.env')

genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

print("Listing supported models for embeddings...")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(m.name)
