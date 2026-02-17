#!/bin/bash
# Run FastAPI backend

cd "$(dirname "$0")"
source myenv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
