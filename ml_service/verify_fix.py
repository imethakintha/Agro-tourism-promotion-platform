import requests
import time

url = "http://localhost:5001/api/ai/agro-guide"
payload = {
    "query": "What are the common pests in paddy cultivation?",
    "userId": "verify-fix"
}

print(f"Sending request to {url}...")
try:
    response = requests.post(url, json=payload, timeout=60)
    print("Status Code:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- RESPONSE ---")
        print(data.get("response", "No response text found")[:200] + "...") 
        print(f"\nSources: {data.get('sources')}")
        print("✅ VERIFICATION SUCCESSFUL")
    else:
        print("\n❌ Error Response:")
        print(response.text)

except Exception as e:
    print(f"❌ Request Failed: {e}")
