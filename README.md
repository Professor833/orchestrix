# Orchestrix: AI-Powered Workflow Automation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)

Orchestrix is a comprehensive, open-source platform designed to build, manage, and execute complex workflows with a strong emphasis on AI-driven tasks, real-time monitoring, and seamless integration with external services.

## ✨ Features

- **Visual Workflow Builder**: A drag-and-drop interface to create complex workflows with various node types (Triggers, Actions, Conditions, Outputs).
- **Real-time Execution Monitoring**: Live tracking of workflow executions with step-by-step details, logs, and status updates via WebSockets.
- **Enhanced Dashboard**: A central hub for real-time statistics, quick actions, recent activity feeds, and system-wide analytics.
- **Workflow Templates Marketplace**: A collection of pre-built, real-world workflow templates (e.g., Email Automation, Social Media Scheduling, Customer Support) that can be deployed with one click.
- **Advanced Analytics**: Interactive charts and data visualizations for tracking workflow performance, execution trends, and system metrics.
- **Comprehensive Integration Management**: Support for various integration types (OAuth, Webhooks, APIs) with a secure system for managing credentials.
- **User Management & RBAC**: Role-Based Access Control to manage user permissions (Admin, Manager, User) and a system for inviting new users.
- **Interactive API Documentation**: A Swagger/OpenAPI interface for exploring and testing the backend API endpoints.
- **Real-time Notification System**: A notification center with a bell icon, unread count, and dropdown panel for important system alerts.
- **Performance Monitoring**: A dedicated view for monitoring system health, including CPU, memory, and database performance.
- **Mobile-Responsive Design**: Fully responsive UI that works seamlessly across desktops, tablets, and mobile devices.
- **Dark Mode**: A sleek and modern dark theme to reduce eye strain.
- **Scalable Architecture**: Built with Celery for asynchronous task processing, ensuring that workflows can scale to handle high volumes.

## 🛠 Tech Stack

| Category          | Technology                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Backend**       | Django 5.x, Django REST Framework, Celery, Channels                                                          |
| **Frontend**      | Next.js 14, React 18, TypeScript, Tailwind CSS                                                               |
| **Database**      | PostgreSQL                                                                                                   |
| **Message Broker**| Redis                                                                                                        |
| **Real-time**     | WebSockets (via Django Channels), React Query (for data fetching), EventSource                               |
| **UI/UX**         | Shadcn/UI, Lucide React (icons), Recharts (charts), Zod (validation), React Hook Form                          |
| **Authentication**| JWT (JSON Web Tokens) with automatic token refresh                                                           |
| **Deployment**    | Docker, Docker Compose                                                                                       |
| **Code Quality**  | ESLint, Prettier, flake8, black, isort, pre-commit hooks                                                       |

## 📂 Project Structure

```
orchestrix/
├── backend/                  # Django Backend
│   ├── apps/                 # Application-specific logic
│   │   ├── authentication/   # User authentication and JWT handling
│   │   ├── executions/       # Workflow execution tracking and logs
│   │   ├── integrations/     # External service integrations (OAuth, Webhooks)
│   │   └── workflows/        # Workflow creation, management, and templates
│   ├── orchestrix/           # Django project settings and core configuration
│   ├── Dockerfile
│   └── manage.py
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router, pages, and layouts
│   │   ├── components/       # Reusable React components (UI, dashboard, etc.)
│   │   ├── lib/              # Core logic, API client, services, auth context
│   │   └── types/            # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Docker configuration for all services
├── .env.example              # Template for environment variables
├── LINTING.md                # Guide for code quality and linting setup
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+ for local dev)
- Python (v3.11+ for local dev)

### 1. Clone & Configure
```bash
# Clone the repository
git clone <repository-url>
cd orchestrix

# Create an environment file from the example
cp .env.example .env

# Customize your .env file (update secrets, database credentials, etc.)
nano .env
```

### 2. Run with Docker (Recommended)
This is the simplest way to get the entire platform running.

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# View logs for all services
docker-compose logs -f

# Run database migrations
docker-compose exec backend python manage.py migrate

# Populate the database with workflow templates
docker-compose exec backend python manage.py populate_workflow_templates

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Stop all services
docker-compose down
```

### Accessing the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **API Docs (Swagger)**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **Admin Panel**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

## 📝 API Documentation
The backend API is documented using OpenAPI (Swagger). Once the backend service is running, you can explore and interact with all the available endpoints by visiting [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/).

## ⚙️ Local Development Setup
For developers who prefer to run services locally without Docker.

### Backend Setup
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set required environment variables (or use a .env file with python-decouple)
export DATABASE_URL=...
export REDIS_URL=...
export SECRET_KEY=...

# Run database migrations
python manage.py migrate
python manage.py populate_workflow_templates

# Start the development server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create a local environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the development server
npm run dev
```

### Celery Workers
For asynchronous tasks to run, you need to start the Celery worker and scheduler.
```bash
# In the backend directory with virtual env activated
# Start the Celery worker
celery -A orchestrix worker --loglevel=info

# In another terminal, start the Celery beat scheduler
celery -A orchestrix beat --loglevel=info
```

## ✅ Code Quality & Linting
This project enforces a high standard of code quality using a combination of linters and formatters.

- **Backend**: `flake8`, `black`, `isort`
- **Frontend**: `ESLint`, `Prettier`, `TypeScript`
- **Hooks**: `pre-commit` hooks to automate checks before every commit.

For detailed setup instructions, please see [LINTING.md](./LINTING.md).

### Common Commands
```bash
# Backend: Run all checks and formatting
cd backend && make check

# Frontend: Run all checks and formatting
cd frontend && npm run check-all
```

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.