import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Change to backend directory to ensure relative imports work
os.chdir(backend_path)

from main import app

# Export the app for Vercel (ASGI application)
handler = app

