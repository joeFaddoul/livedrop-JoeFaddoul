#!/usr/bin/env python3
import os
import sys
import requests
import json
from datetime import datetime

def main():
    # === Get ngrok base URL ===
    base_url = None
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = os.environ.get("RAG_BASE_URL")

    if not base_url:
        print("Usage: python chat-interface.py <ngrok-url>")
        print("Or set RAG_BASE_URL environment variable.")
        sys.exit(1)

    if not base_url.startswith("http"):
        base_url = "https://" + base_url

    # === Health check ===
    try:
        health = requests.get(f"{base_url}/health", timeout=20).json()
        print(f"[{datetime.utcnow().isoformat()}Z] Connected to {base_url}")
        print(f"Model: {health.get('model')} | Embedder: {health.get('embedder')} | Docs: {health.get('docs_loaded')}")
    except Exception as e:
        print("Could not connect to backend:", e)
        sys.exit(1)

    print("\nType your question. Press Enter on an empty line or type 'exit' to quit.\n")

    # === Open log file ===
    os.makedirs("logs", exist_ok=True)
    log_file = os.path.join("logs", "chat_log.jsonl")

    # === Chat loop ===
    while True:
        q = input("> ").strip()
        if not q or q.lower() in {"exit", "quit"}:
            print("Exiting chat.")
            break

        try:
            r = requests.post(
                f"{base_url}/chat",
                json={"query": q, "top_k": 3, "prompt_key": "base_retrieval_prompt"},
                timeout=60
            )
            r.raise_for_status()
            j = r.json()
            answer = (j.get("answer") or j.get("response") or "").replace("[Your response based on context]", "").strip()
            sources = j.get("sources", [])
            latency = j.get("latency_ms", "n/a")

            print("\nAnswer:", answer if answer else "(no answer)")
            print("Sources:", ", ".join(sources) if sources else "—")
            print("Latency:", latency, "ms")
            print("-" * 80)

            # log entry
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "question": q,
                    "answer": answer,
                    "sources": sources,
                    "latency_ms": latency
                }) + "\n")

        except Exception as e:
            print("Error contacting API:", e)

if __name__ == "__main__":
    main()
