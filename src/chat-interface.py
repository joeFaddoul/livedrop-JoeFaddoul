import requests
import datetime
import json

def main():
    base_url = input("Enter your ngrok or Flask URL: ").strip()
    if not base_url.startswith("http"):
        print("Invalid URL. Please include http:// or https://")
        return

    log_file = "chat_log.jsonl"
    print(f"Connected to {base_url}")
    print("Type your question. Press Enter on an empty line or type 'exit' to quit.\n")

    while True:
        question = input("> ").strip()
        if not question or question.lower() == "exit":
            print("Goodbye")
            break

        try:
            print("[Retrieving context...]")
            print("[Calling LLM...]")

            resp = requests.post(
                f"{base_url}/chat",
                json={"question": question, "prompt_type": "auto"},
                timeout=30
            )

            if resp.status_code != 200:
                print(f"Error: {resp.status_code} {resp.text}")
                continue

            data = resp.json()

            # Extract fields safely
            answer = data.get("answer") or data.get("response", "")
            sources = data.get("sources", [])
            confidence = data.get("confidence", "Unknown")

            # Print formatted result
            print(f"\nAnswer: {answer}")
            if isinstance(sources, list) and sources:
                srcs = ", ".join([s.get("title", "") for s in sources])
                print(f"Sources: {srcs}")
            else:
                print("Sources: None")
            print(f"Confidence: {confidence}\n")

            # Log conversation
            with open(log_file, "a", encoding="utf-8") as f:
                log_entry = {
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "question": question,
                    "answer": answer,
                    "sources": sources,
                    "confidence": confidence,
                }
                f.write(json.dumps(log_entry) + "\n")

        except requests.exceptions.RequestException as e:
            print(f" Connection error: {e}")
        except Exception as e:
            print(f" Unexpected error: {e}")

if __name__ == "__main__":
    main()
