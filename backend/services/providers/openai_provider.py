"""
MindForge AI — OpenAI API Provider (backend/services/providers/openai_provider.py)

Queries the OpenAI Chat Completions API using Python's standard urllib library.
"""

import json
import urllib.request
import urllib.error

def generate_with_openai(api_key: str, system_prompt: str, user_prompt: str) -> dict:
    """
    Call OpenAI API (gpt-4o-mini) to generate a structured project plan.
    Returns the parsed JSON dictionary.
    """
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    
    try:
        print(f"[OpenAI Provider] Sending request to {url}")
        with urllib.request.urlopen(req, timeout=45) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            
            # Extract content from response
            text_response = res_json["choices"][0]["message"]["content"]
            print("[OpenAI Provider] API Response text received successfully.")
            
            # Parse response text as JSON
            parsed_data = json.loads(text_response.strip())
            return parsed_data
            
    except urllib.error.HTTPError as http_err:
        err_msg = http_err.read().decode("utf-8")
        print(f"[OpenAI Provider] HTTP Error {http_err.code}: {err_msg}")
        raise Exception(f"OpenAI HTTP Error {http_err.code}: {err_msg}")
    except json.JSONDecodeError as json_err:
        print(f"[OpenAI Provider] JSON Parsing Error: {json_err}")
        raise Exception(f"OpenAI returned invalid JSON structure: {json_err}")
    except Exception as e:
        print(f"[OpenAI Provider] Unexpected error occurred: {e}")
        raise e
