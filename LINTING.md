# Linting and Code Quality Setup

This project uses comprehensive linting and code formatting tools for both backend (Python/Django) and frontend (TypeScript/Next.js) to ensure consistent code quality.

## Backend (Python/Django)

### Tools Used
- **flake8**: Python linting
- **black**: Code formatting
- **isort**: Import sorting
- **pytest**: Testing framework

### Configuration Files
- `.flake8`: Flake8 configuration
- `pyproject.toml`: Black, isort, and pytest configuration
- `Makefile`: Development commands

### Available Commands

```bash
cd backend

# Run all linting checks
make lint

# Format code
make format

# Fix all formatting issues
make fix

# Run comprehensive checks
make check

# Individual commands
flake8 .
black --check .
isort --check-only .

# Format individual tools
black .
isort .
```

### Configuration Details

#### Flake8 (.flake8)
- Max line length: 88 (compatible with black)
- Ignores E203, W503, E501 (conflicts with black)
- Excludes migrations, venv, and cache directories

#### Black (pyproject.toml)
- Line length: 88
- Target Python 3.11+
- Excludes migrations and build directories

#### isort (pyproject.toml)
- Compatible with black profile
- Django-aware import sorting
- Line length: 88

## Frontend (TypeScript/Next.js)

### Tools Used
- **ESLint**: TypeScript/JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### Configuration Files
- `.eslintrc.json`: ESLint configuration
- `.prettierrc.json`: Prettier configuration
- `.prettierignore`: Files to ignore
- `tsconfig.json`: TypeScript configuration

### Available Commands

```bash
cd frontend

# Run all checks
npm run check-all

# Fix all issues
npm run fix-all

# Individual commands
npm run lint           # ESLint check
npm run lint:fix       # ESLint fix
npm run format         # Format with Prettier
npm run format:check   # Check Prettier formatting
npm run type-check     # TypeScript type checking
```

### Configuration Details

#### ESLint (.eslintrc.json)
- Extends Next.js, TypeScript, and Prettier configs
- Custom rules for unused variables, console warnings
- Ignores build directories

#### Prettier (.prettierrc.json)
- No semicolons
- Single quotes
- Line length: 80
- Tailwind CSS class sorting

## IDE Integration

### VS Code Settings (.vscode/settings.json)
- Auto-format on save
- Proper Python interpreter path
- ESLint and Prettier integration
- Exclude unnecessary files from search

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.flake8",
    "ms-python.isort",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## Pre-commit Hooks

### Installation
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
```

### What Gets Checked
- Trailing whitespace
- End of file fixes
- YAML syntax
- Large file checks
- Python: black, isort, flake8
- Frontend: prettier, eslint

## CI/CD Integration

### GitHub Actions (.github/workflows/lint.yml)
- Runs on push and pull requests
- Separate jobs for backend and frontend
- Caches dependencies for faster builds
- Fails on linting errors

## Usage Guidelines

### Development Workflow
1. Write code
2. Run `make fix` (backend) or `npm run fix-all` (frontend)
3. Commit changes (pre-commit hooks will run)
4. Push to repository (CI will validate)

### Before Committing
```bash
# Backend
cd backend
make check

# Frontend
cd frontend
npm run check-all
```

### Fixing Common Issues

#### Backend
```bash
# Fix import order
isort .

# Fix formatting
black .

# Check what flake8 complains about
flake8 . --statistics
```

#### Frontend
```bash
# Fix ESLint issues
npm run lint:fix

# Fix formatting
npm run format

# Check types
npm run type-check
```

## Customization

### Adding New Rules
- Backend: Edit `.flake8` and `pyproject.toml`
- Frontend: Edit `.eslintrc.json` and `.prettierrc.json`

### Excluding Files
- Backend: Update exclude patterns in configuration files
- Frontend: Add to `.eslintignore` or `.prettierignore`

### CI/CD
- Modify `.github/workflows/lint.yml` for different checks
- Add environment-specific configurations

## Troubleshooting

### Common Issues
1. **Import order conflicts**: Run `isort .` in backend
2. **Line length**: Adjust in both flake8 and black configs
3. **TypeScript errors**: Check `tsconfig.json` strictness
4. **Prettier conflicts**: Ensure ESLint extends prettier config

### Performance
- Use caching in CI/CD for faster builds
- Run linting in parallel where possible
- Consider incremental checking for large codebases