#!/usr/bin/env python3
import os
import sys
import json
import time
import requests
from datetime import datetime

def iso_utc_now():
    # timezone-aware ISO-8601 without microseconds
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def get_base_url():
    # CLI arg wins, then env var
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.environ.get("RAG_BASE_URL", "").strip()
    if not url:
        print("Usage: python src/chat-interface.py <ngrok-url>")
        print("Or set RAG_BASE_URL environment variable.")
        sys.exit(1)
    if not url.startswith("http"):
        url = "https://" + url
    return url.rstrip("/")

def healthcheck(base_url):
    try:
        r = requests.get(f"{base_url}/health", timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print("Could not connect to backend:", e)
        sys.exit(1)

def ask(base_url, question, top_k=3, prompt_key="base_retrieval_prompt", timeout=60):
    """
    Returns: (answer, sources:list[str], latency_ms:int)
    """
    payload = {"query": question, "top_k": top_k, "prompt_key": prompt_key}

    # status lines to mirror the assignment example
    print("[Retrieving context...]")
    print("[Calling LLM...]")

    t0 = time.perf_counter()
    r = requests.post(f"{base_url}/chat", json=payload, timeout=timeout)
    t1 = time.perf_counter()

    r.raise_for_status()
    j = r.json()

    # prefer server-side latency if present; otherwise use client timing
    latency_ms = int(j.get("latency_ms")) if isinstance(j.get("latency_ms"), (int, float)) else int((t1 - t0) * 1000)

    # sanitize common fields
    raw_answer = j.get("answer") or j.get("response") or ""
    answer = raw_answer.replace("[Your response based on context]", "").strip()
    sources = j.get("sources", [])

    return answer, sources, latency_ms

def log_turn(log_path, row):
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

def main():
    base_url = get_base_url()
    h = healthcheck(base_url)
    print(f"[{iso_utc_now()}] Connected to {base_url}")
    print(f"Model: {h.get('model')} | Embedder: {h.get('embedder')} | Docs: {h.get('docs_loaded')}\n")
    print("Type your question. Press Enter on an empty line or type 'exit' to quit.\n")

    log_file = os.path.join("logs", "chat_log.jsonl")

    while True:
        try:
            q = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting chat.")
            break

        if not q or q.lower() in {"exit", "quit"}:
            print("Exiting chat.")
            break

        try:
            answer, sources, latency_ms = ask(base_url, q, top_k=3, prompt_key="base_retrieval_prompt")
            print("\nAnswer:", answer if answer else "(no answer)")
            print("Sources:", ", ".join(sources) if sources else "—")
            print("Latency:", f"{latency_ms} ms")
            print("-" * 80)

            log_turn(log_file, {
                "timestamp": iso_utc_now(),
                "base_url": base_url,
                "question": q,
                "answer": answer,
                "sources": sources,
                "latency_ms": latency_ms
            })

        except requests.exceptions.Timeout:
            print("Error: request timed out.")
        except requests.exceptions.ConnectionError as e:
            print("Error: connection problem:", e)
        except requests.HTTPError as e:
            # Print server error payload if available
            try:
                err_payload = e.response.json()
            except Exception:
                err_payload = e.response.text
            print("HTTP error:", e, "| payload:", err_payload)
        except Exception as e:
            print("Unexpected error:", e)

if __name__ == "__main__":
    main()
