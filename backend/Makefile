.PHONY: help lint format check test install clean
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pip install -r requirements.txt

lint: ## Run all linting checks
	flake8 .
	black --check .
	isort --check-only .

format: ## Format code with black and isort
	black .
	isort .

check: ## Run type checking and linting
	python manage.py check
	flake8 .
	black --check .
	isort --check-only .

fix: ## Fix linting issues
	black .
	isort .

test: ## Run tests
	python manage.py test

runserver: ## Start development server
	python manage.py runserver

migrate: ## Run database migrations
	python manage.py migrate

makemigrations: ## Create new migrations
	python manage.py makemigrations

shell: ## Open Django shell
	python manage.py shell

clean: ## Clean cache files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +