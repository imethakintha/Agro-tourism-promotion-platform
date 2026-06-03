import os
import json
import re
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter

def clean_text(text):
    """
    Cleans extracted text by removing page numbers, fixing encoding issues,
    and collapsing whitespace.
    """
    if not text:
        return ""
    
    # Remove common page number patterns (e.g., "Page 1 of 10", "1")
    # This is a basic regex, might need tuning based on specific PDF formats
    text = re.sub(r'Page \d+ of \d+', '', text) 
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Fix potential encoding artifacts (example: replacing non-breaking spaces)
    text = text.replace('\xa0', ' ')
    
    # Remove excessive newlines and whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def process_pdfs():
    raw_pdf_dir = "./data/raw_pdfs"
    output_file = "./data/processed_data.json"
    
    if not os.path.exists(raw_pdf_dir):
        print(f"⚠️ Directory '{raw_pdf_dir}' does not exist.")
        return

    pdf_files = [f for f in os.listdir(raw_pdf_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print(f"⚠️ No PDF files found in '{raw_pdf_dir}'.")
        return

    print(f"📄 Found {len(pdf_files)} PDF files to process.")

    all_chunks = []
    
    # LangChain Splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )

    for pdf_file in pdf_files:
        pdf_path = os.path.join(raw_pdf_dir, pdf_file)
        print(f"Processing: {pdf_file}...")
        
        full_text = ""
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"
        except Exception as e:
            print(f"❌ Error reading {pdf_file}: {e}")
            continue

        cleaned_text = clean_text(full_text)
        
        # Split text into chunks
        chunks = text_splitter.split_text(cleaned_text)
        
        print(f"  -> Generated {len(chunks)} chunks.")

        for i, chunk in enumerate(chunks):
            all_chunks.append({
                "source": pdf_file,
                "chunk_id": i,
                "text": chunk
            })

    # Save to JSON
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_chunks, f, indent=4, ensure_ascii=False)
        print(f"✅ Successfully saved {len(all_chunks)} chunks to '{output_file}'")
    except Exception as e:
        print(f"❌ Error saving output file: {e}")

if __name__ == "__main__":
    process_pdfs()
