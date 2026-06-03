import requests
import json
import time

url = "http://localhost:5001/api/ai/agro-guide"
payload = {
    "query": "What makes Ceylon Cinnamon unique?",
    "userId": "test-verifier-2"
}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, json=payload, timeout=60)
    print("Status Code:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- RESPONSE ---")
        print(data.get("response", "No response text found"))
        print("\n--- SOURCES ---")
        print(data.get("sources", []))
    else:
        print("\n❌ Error Response:")
        print(response.text)

except Exception as e:
    print(f"❌ Request Failed: {e}")
