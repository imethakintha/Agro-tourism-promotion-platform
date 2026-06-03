import os
import sys
import time
import json
from pymongo import MongoClient
from google import genai
from dotenv import load_dotenv

load_dotenv(dotenv_path='../server/.env')

# Configure Gemini
client_ai = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))
                         

# --- CONFIGURATION ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "agrolk-FinalYP" 
COLLECTION_NAME = "agro_vectors"
DATA_FILE = "./data/processed_data.json"

# Initialize MongoDB Connection
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]
    collection = db[COLLECTION_NAME]
    print(f"🔗 Connected to MongoDB Atlas: Database '{DB_NAME}'")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    sys.exit(1)

def get_gemini_embeddings_with_retry(texts, max_retries=5):
    """
    Generates embeddings using Google Gemini's embedding model.
    """
    for attempt in range(max_retries):
        try:
            results = client_ai.models.embed_content(
                model="gemini-embedding-001",
                contents=texts,
                config={'task_type': 'retrieval_document'}
            )
            return [e.values for e in results.embeddings]
            
        except Exception as e:
            error_msg = str(e)
            if "Resource has been exhausted" in error_msg or "429" in error_msg:
                wait_time = (2 ** attempt) * 10
                print(f"⚠️ Quota exceeded. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(wait_time)
            else:
                print(f"❌ API Error: {e}")
                raise e
                
    raise Exception("Max retries exceeded for embedding generation.")

def ingest():
    if not os.path.exists(DATA_FILE):
        print(f"⚠️ Data file '{DATA_FILE}' not found. Please run process_pdfs.py first.")
        return

    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data_chunks = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON file: {e}")
        return
    
    if not data_chunks:
        print("⚠️ No content to ingest in JSON file.")
        return

    print(f"📄 Found {len(data_chunks)} chunks to ingest.")

    documents_to_insert = []
    
    # Batch processing to handle large amounts of data
    batch_size = 5
    total_chunks = len(data_chunks)
    
    print("⏳ Generating embeddings and preparing MongoDB documents...")

    for i in range(0, total_chunks, batch_size):
        batch = data_chunks[i:i+batch_size]
        batch_texts = [item['text'] for item in batch]
        
        batch_num = (i // batch_size) + 1
        total_batches = (total_chunks + batch_size - 1) // batch_size
        print(f"   Processing batch {batch_num}/{total_batches}...")

        try:
            # Get embeddings for the current batch
            embeddings = get_gemini_embeddings_with_retry(batch_texts)
            
            # Prepare documents in MongoDB Atlas Vector Search format
            for idx, item in enumerate(batch):
                doc = {
                    "text": item['text'],
                    "metadata": {
                        "source": item['source'],
                        "chunk_id": item['chunk_id']
                    },
                    "embedding": embeddings[idx] # මෙන්න මේක තමයි Atlas එකේ search වෙන්නේ
                }
                documents_to_insert.append(doc)
            
            time.sleep(1) 
            
        except Exception as e:
            print(f"❌ Error in batch {batch_num}: {e}")
            break

    # Insert into MongoDB
    if documents_to_insert:
        print(f"⏳ Inserting {len(documents_to_insert)} documents into MongoDB Atlas...")
        try:
            collection.insert_many(documents_to_insert)
            print(f"✅ Successfully ingested data into '{DB_NAME}.{COLLECTION_NAME}'!")
            print("💡 Reminder: Ensure your Atlas Vector Search Index is created with name 'default'.")
        except Exception as e:
            print(f"❌ MongoDB Insert Error: {e}")
    else:
        print("⚠️ No valid documents were prepared for insertion.")

if __name__ == "__main__":
    ingest()