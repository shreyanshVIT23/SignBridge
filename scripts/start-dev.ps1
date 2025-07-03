# Start development servers for Speech-to-Sign Language App

Write-Host "Starting development servers..." -ForegroundColor Cyan

# Start backend in a new PowerShell window
Write-Host "Starting backend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location backend; .\.venv\Scripts\Activate.ps1; uvicorn app:app --reload --port 8000"

# Start frontend in a new PowerShell window
Write-Host "Starting frontend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev -- --host --port 5173"

Write-Host ""
Write-Host "Backend running on http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend running on http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are running in separate terminal windows."
Write-Host "Close those windows or press Ctrl+C in each to stop them." -ForegroundColor Yellow
