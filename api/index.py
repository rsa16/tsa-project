from fastapi import FastAPI, Request
from main import app

# This is required for Vercel
def handler(request: Request):
    return app(request.scope, request.receive, request.send)