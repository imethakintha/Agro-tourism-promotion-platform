from google import genai
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../server/.env')
client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

print(f"Testing embedding with model: {model}")

def test_embedding(text_to_test):
    try:
        result = client.models.embed_content(
            model="text-embedding-004",
            contents="Hello world",
            config={'task_type': 'retrieval_document'}
        )
        embeddings = result['embedding']
        
        print("✅ Success!")
        print(f"Vector sample: {result.embeddings[0].values[:5]}")
    # print(result)
    except Exception as e:
        print(f"❌ Failed: {e}")

model2 = "models/text-embedding-004"
print(f"\nTesting embedding with model: {model2}")
try:
    result = genai.embed_content(
        model=model2,
        content="Hello world",
        task_type="retrieval_document"
    )
    print("✅ Success!")
except Exception as e:
    print(f"❌ Failed: {e}")
