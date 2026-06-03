import os
import sys
from dotenv import load_dotenv

# Try importing
try:
    from google import genai
    print("✅ Imported google.genai")
except ImportError as e:
    print(f"❌ Failed to import google.genai: {e}")
    sys.exit(1)

load_dotenv(dotenv_path='../server/.env')
api_key = os.getenv("GOOGLE_GEMINI_API_KEY")

if not api_key:
    print("❌ No API Key found")
    sys.exit(1)

try:
    client = genai.Client(api_key=api_key)
    print("✅ Client initialized")
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello, are you working?'
    )
    print("✅ Generation successful")
    print(response.text)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
