#!/bin/bash
# Setup script for Speech-to-Sign Language App

echo "Starting Speech-to-Sign Language App setup..."

echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3.8+ is required but not installed. Please install Python first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: Node.js and npm are required but not installed. Please install Node.js first."
    exit 1
fi

# Setup Backend
echo "Setting up Python backend..."
cd backend || { echo "Error: Could not enter backend directory"; exit 1; }
python -m venv .venv
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
else
    echo "Error: Could not activate virtual environment"
    exit 1
fi

pip install -r requirements.txt || { echo "Error: Failed to install Python dependencies"; exit 1; }
cd .. || { echo "Error: Could not return to root directory"; exit 1; }

# Setup Frontend
echo "Setting up React frontend..."
cd frontend || { echo "Error: Could not enter frontend directory"; exit 1; }
npm install || { echo "Error: Failed to install npm dependencies"; exit 1; }
cd .. || { echo "Error: Could not return to root directory"; exit 1; }

echo ""
echo "Setup complete!"
echo "To start the development servers, run:"
echo "    ./scripts/start-dev.sh"
echo ""
echo "The application will be available at:"
echo "    Frontend: http://localhost:5173"
echo "    Backend API: http://localhost:8000"
echo ""
echo "Note: Docker support is currently experimental. We recommend using the local setup for development."