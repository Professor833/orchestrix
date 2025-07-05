# AI Workflow Automation Platform

A comprehensive AI-powered workflow automation platform built with Django, Next.js, and Celery.

## Architecture Overview

- **Backend**: Django 5.2.4 + Django REST Framework + Celery
- **Frontend**: Next.js 14+ with TypeScript + Tailwind CSS
- **Database**: PostgreSQL
- **Message Broker**: Redis
- **Authentication**: JWT-based
- **Deployment**: Docker containers

## Project Structure

```
orchestrix/
├── backend/                    # Django backend
│   ├── orchestrix/            # Django project
│   ├── apps/                  # Django apps
│   │   ├── authentication/    # User auth
│   │   ├── workflows/         # Workflow management
│   │   ├── executions/        # Execution tracking
│   └── integrations/      # External integrations
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker config
│   └── manage.py             # Django management
├── frontend/                  # Next.js frontend
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   └── types/            # TypeScript types
│   ├── package.json          # Node.js dependencies
│   └── Dockerfile           # Frontend Docker config
├── docker-compose.yml        # Multi-container setup
├── .env.example             # Environment variables template
├── LINTING.md               # Code quality setup guide
└── README.md                # This file
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd orchestrix

# Copy environment variables
cp .env.example .env

# Edit .env with your configurations
nano .env
```

### 2. Run with Docker

```bash
# Build and start all services
docker-compose up --build

# In another terminal, run migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
```

### 3. Local Development Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost:5432/orchestrix
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=your-secret-key

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

#### Celery Workers

```bash
# In backend directory
cd backend

# Start Celery worker
celery -A orchestrix worker --loglevel=info

# Start Celery beat (in another terminal)
celery -A orchestrix beat --loglevel=info
```

## Code Quality and Linting

This project uses comprehensive linting and code formatting tools for consistent code quality.

### Backend (Python/Django)
- **flake8**: Python linting
- **black**: Code formatting
- **isort**: Import sorting

```bash
cd backend

# Check code quality
make lint

# Fix formatting issues
make fix

# Run all checks
make check
```

### Frontend (TypeScript/Next.js)
- **ESLint**: TypeScript/JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

```bash
cd frontend

# Check all linting
npm run check-all

# Fix all issues
npm run fix-all
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks (optional)
pip install pre-commit
pre-commit install
```

For detailed linting setup and configuration, see [LINTING.md](LINTING.md).

## API Documentation

Once the backend is running, visit:
- API Documentation: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

## Environment Variables

See `.env.example` for all required environment variables.

## Development Commands

### Backend

```bash
# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Shell access
python manage.py shell
```

### Frontend

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Deployment

### Production Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Set production environment variables
2. Build frontend: `npm run build`
3. Collect static files: `python manage.py collectstatic`
4. Run migrations: `python manage.py migrate`
5. Start services with process manager (PM2, Supervisor, etc.)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

## License

This project is licensed under the MIT License.