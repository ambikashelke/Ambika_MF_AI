"""
MindForge AI — Gemini API Provider

Queries the Gemini REST API using Python's standard urllib library.
"""

import json
import urllib.request
import urllib.error

def generate_with_gemini(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    """
    Call Gemini API (gemini-2.5-flash) to generate a structured project plan.
    Returns the parsed JSON dictionary.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }
    
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    
    try:
        print(f"[Gemini Provider] Sending request to {url.split('?')[0]}")
        with urllib.request.urlopen(req, timeout=45) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            
            # Extract output text
            text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
            print("[Gemini Provider] API Response text received successfully.")
            
            # Parse response text as JSON
            parsed_data = json.loads(text_response.strip())
            return parsed_data
            
    except urllib.error.HTTPError as http_err:
        err_msg = http_err.read().decode("utf-8")
        print(f"[Gemini Provider] HTTP Error {http_err.code}: {err_msg}")
        raise Exception(f"Gemini HTTP Error {http_err.code}: {err_msg}")
    except json.JSONDecodeError as json_err:
        print(f"[Gemini Provider] JSON Parsing Error: {json_err}")
        raise Exception(f"Gemini returned invalid JSON structure: {json_err}")
    except Exception as e:
        print(f"[Gemini Provider] Unexpected error occurred: {e}")
        raise e
