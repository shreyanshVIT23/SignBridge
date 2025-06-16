# SignBridge

A Speech-to-Sign Language Conversion System that converts spoken language into sign language visualizations.

## Project Status

⚠️ **Development Status**: This project is currently under active development. While Docker support is available for testing purposes, it is not yet considered stable for production use. We recommend running the application locally for the best experience.

## Features

- Real-time speech recognition
- Sign language gesture visualization
- Multi-language support
- Interactive user interface
- Backend API for gesture processing

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Installation

### Local Development Setup

#### Using Setup Script (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/shreyanshVIT23/SignBridge.git
cd SignBridge
```

2. Run the setup script:
```bash
./scripts/setup.sh
```

3. Start the development servers:
```bash
./scripts/start-dev.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

#### Manual Setup (Alternative)

1. Clone the repository:
```bash
git clone https://github.com/shreyanshVIT23/SignBridge.git
cd SignBridge
```

2. Setup Backend:
```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

3. Setup Frontend:
```bash
cd ../frontend
npm install
```

4. Start Backend Server:
```bash
cd ../backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

5. In a new terminal, start Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Docker Setup (Experimental)

⚠️ **Note**: Docker support is currently experimental and may not be fully stable. We recommend using the local development setup for now.

#### Using Docker Compose (Recommended)

1. Build the Docker containers:
```bash
docker-compose build
```

2. Run the containers:
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:80
- Backend API: http://localhost:8000

#### Manual Docker Setup (Alternative)

1. Build the backend container:
```bash
docker build -t signbridge-backend -f backend/Dockerfile .
```

2. Build the frontend container:
```bash
docker build -t signbridge-frontend -f frontend/Dockerfile .
```

3. Run the backend container:
```bash
docker run -d --name signbridge-backend -p 8000:8000 signbridge-backend
```

4. Run the frontend container:
```bash
docker run -d --name signbridge-frontend -p 3000:3000 signbridge-frontend
```

The application will be available at:
- Frontend: http://localhost:80
- Backend API: http://localhost:8000

#### Stopping Docker Containers

To stop the containers:
```bash
docker stop signbridge-backend signbridge-frontend
```

To remove the containers:
```bash
docker rm signbridge-backend signbridge-frontend
```

## Usage Guide

1. Open the application in your web browser at http://localhost:5173/80
2. Grant microphone access when prompted
3. Start speaking and watch the sign language visualization
4. Use the controls to:
   - Pause/Resume recognition
   - Clear the visualization

## Project Structure

```
signbridge/
├── backend/          # FastAPI backend server
├── frontend/         # React frontend application
├── scripts/          # Utility scripts
└── docker            # Docker configuration files
```

## Development

### Running in Development Mode

1. Start both servers using the start-dev script:
```bash
./scripts/start-dev.sh
```

2. The script will automatically:
   - Activate Python virtual environment
   - Start the FastAPI backend with hot-reload
   - Start the React frontend in development mode

### Making Changes

- Backend changes will automatically reload the server
- Frontend changes will trigger a hot reload
- Both servers can be stopped with Ctrl+C

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for Whisper speech recognition
- FastAPI for backend framework
- React for frontend framework
- Various open-source libraries and contributors

## Support

For support, please open an issue in the GitHub repository.