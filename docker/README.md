# Docker Setup for Doctor Dashboard Frontend

Simple Dockerfile for building and deploying the React doctor dashboard to Azure Web App.

## Build the Docker Image

From the `doctor-dashboard-frontend` directory, run:

```bash
docker build -t doctor-dashboard-frontend -f docker/Dockerfile .
```

## Run the Container Locally

```bash
docker run -p 3000:80 doctor-dashboard-frontend
```

The application will be available at http://localhost:3000

## Azure Deployment

```bash
# Tag for Azure Container Registry
docker tag doctor-dashboard-frontend elteacrwep.azurecr.io/dpred-frontend-doctor-service:latest

# Push to registry
docker push elteacrwep.azurecr.io/dpred-frontend-doctor-service:latest
```

## What it does

1. **Build Stage**: Uses Node.js 22 Alpine to build the React app
   - Installs all dependencies
   - Runs `npm run build` to create optimized production build

2. **Production Stage**: Uses nginx:alpine to serve static files
   - Minimal final image size (~23MB)
   - Includes nginx config for client-side routing
   - Runs on port 80 for Azure Web App

## Environment Variables

If you need to configure API endpoints, add them to a `.env` file before building:

```env
REACT_APP_API_URL=https://your-api-endpoint.com
```

React environment variables must start with `REACT_APP_` to be included in the build.