# Turborepo Setup Guide

This document provides detailed information about the Turborepo setup for the Culturalite monorepo.

## Architecture

### Package Structure

```
culturalite/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # Django API (with minimal package.json for Turborepo)
├── packages/
│   └── e2e-tests/         # Playwright tests
├── src/                   # Shared utilities and types
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace configuration
```

### Workspace Configuration

The root `package.json` defines workspaces:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## Pipeline Configuration

The `turbo.json` file defines task pipelines with dependencies, inputs, and outputs:

### Key Pipelines

- **build**: Builds all packages with proper dependency order
- **dev**: Runs development servers (no caching, persistent)
- **test**: Runs all tests with caching
- **lint**: Lints all packages
- **type-check**: TypeScript type checking

### Pipeline Features

- **Dependency ordering**: `"dependsOn": ["^build"]` ensures dependencies build first
- **Input tracking**: Monitors file changes to determine when to rebuild
- **Output caching**: Caches build artifacts for faster subsequent runs
- **Parallel execution**: Runs independent tasks in parallel

## Development Workflow

### Starting Development

```bash
# Install all dependencies
npm install

# Start all development servers
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://127.0.0.1:8000

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:e2e:only
```

### Linting and Type Checking

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix

# Type check TypeScript packages
npm run type-check
```

## Caching

Turborepo provides intelligent caching:

- **Local cache**: Stored in `.turbo/cache/`
- **Remote cache**: Can be configured for team sharing
- **Cache keys**: Based on inputs (source files, dependencies, environment)

### Cache Management

```bash
# Force rebuild (ignore cache)
npx turbo build --force

# Clear cache
rm -rf .turbo

# View cache statistics
npx turbo build --summarize
```

## Filtering

Run tasks for specific packages:

```bash
# Single package
npx turbo build --filter=frontend

# Multiple packages
npx turbo test --filter=frontend --filter=e2e-tests

# Changed packages only
npx turbo build --filter="[HEAD^1]"

# Packages that depend on changed packages
npx turbo test --filter="...[HEAD^1]"
```

## Best Practices

### 1. Package Naming
- Use simple names without prefixes: `frontend`, `backend`, `e2e-tests`
- Avoid scoped packages unless necessary

### 2. Script Consistency
- Use consistent script names across packages: `build`, `test`, `lint`, `dev`
- Add package-specific scripts as needed

### 3. Dependencies
- Define clear dependencies in `turbo.json`
- Use `^build` for packages that need dependencies built first

### 4. Caching
- Include all relevant inputs in pipeline configuration
- Exclude files that shouldn't trigger rebuilds
- Use appropriate outputs for caching

### 5. Environment Variables
- Include environment files in inputs when they affect builds
- Use `.env.example` files for documentation

## Troubleshooting

### Common Issues

1. **Cache issues**: Clear cache with `rm -rf .turbo`
2. **Dependency issues**: Run `npm install` in root
3. **Build failures**: Check individual package builds first
4. **Port conflicts**: Ensure ports are available for dev servers

### Debugging

```bash
# Verbose output
npx turbo build --verbose

# Dry run
npx turbo build --dry-run

# Generate dependency graph
npx turbo build --graph
```

## Migration Notes

### Changes Made

1. **Structure**: Moved packages to `apps/` and `packages/` directories
2. **Package names**: Simplified to `frontend`, `backend`, `e2e-tests`
3. **Scripts**: Added Turborepo scripts to root `package.json`
4. **Configuration**: Created `turbo.json` with optimized pipelines
5. **Gitignore**: Added Turborepo cache and build artifacts

### Backward Compatibility

- All existing functionality preserved
- Original scripts still work within individual packages
- Environment configurations unchanged
- Build outputs remain the same

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Turborepo Examples](https://github.com/vercel/turbo/tree/main/examples)
- [Caching Guide](https://turbo.build/repo/docs/core-concepts/caching)
- [Filtering Guide](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
