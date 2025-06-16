# Start development servers for Speech-to-Sign Language App

Write-Host "Starting development servers..."

# Start backend
Write-Host "Starting backend server..."
Start-Process powershell -ArgumentList "Set-Location backend; .\.venv\Scripts\Activate.ps1; uvicorn app:app --reload --port 8000"

# Start frontend
Write-Host "Starting frontend server..."
Start-Process npm -ArgumentList "run dev -- --host --port 5173" -WorkingDirectory "frontend"

Write-Host "Backend running on http://localhost:8000"
Write-Host "Frontend running on http://localhost:5173"
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Wait for Ctrl+C
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
