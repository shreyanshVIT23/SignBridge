# Setup script for Speech-to-Sign Language App

Write-Host "Starting Speech-to-Sign Language App setup..."

# Check prerequisites
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python 3.8+ is required but not installed. Please install Python first."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js and npm are required but not installed. Please install Node.js first."
    exit 1
}

# Setup Backend
Write-Host "Setting up Python backend..."
Set-Location backend

# Create virtual environment
python -m venv .venv

# Install dependencies using .venv's pip
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt

Set-Location ..


# Setup Frontend
Write-Host "Setting up React frontend..."
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "Setup complete!"
Write-Host "To start the development servers, run:"
Write-Host "    .\scripts\start-dev.ps1"
Write-Host ""
Write-Host "The application will be available at:"
Write-Host "    Frontend: http://localhost:5173"
Write-Host "    Backend API: http://localhost:8000"
Write-Host ""
Write-Host "Note: Docker support is currently experimental. We recommend using the local setup for development."
