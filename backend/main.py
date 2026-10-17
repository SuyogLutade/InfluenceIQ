"""
InfluenceIQ - Backend Service Entrypoint for Vercel
Re-exports FastAPI application instance for Vercel Python runtime detection.
"""

from app.main import app

__all__ = ["app"]
