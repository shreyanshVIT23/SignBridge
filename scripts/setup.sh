#!/bin/bash
echo "Setting up Speech-to-Sign Language App..."

# Setup Backend
echo "Setting up Python backend..."
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Setup Frontend
echo "Setting up React frontend..."
cd frontend
npm install
cd ..

echo "Setup complete! Run scripts/start-dev.sh to start development servers."