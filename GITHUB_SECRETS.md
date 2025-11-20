# GitHub Secrets Configuration

To enable the full CI/CD pipeline, you must configure the following secrets in your GitHub repository settings:

## 🔐 Core Secrets

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `DOCKER_USER` | Your Docker Hub username | Docker Build & Publish |
| `DOCKER_PAT` | Your Docker Personal Access Token | Docker Build & Publish |
| `DOCKER_REGISTRY` | Registry URL (default: `docker.io`) | Custom Registries |

## 🤖 Provider Secrets (Integration Tests)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `BLACKBOX_MCP_URL` | URL for Blackbox MCP API | Blackbox Provider Tests |
| `BLACKBOX_MCP_HEADERS`| Headers for Blackbox API | Blackbox Provider Tests |

## 🚀 Deployment Secrets (Optional)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `RAILWAY_TOKEN` | Railway API Token | Production Deployment |
| `VERCEL_TOKEN` | Vercel API Token | Edge Functions |
| `SSH_PRIVATE_KEY` | Private key for server access | Custom Server Deployment |
| `SSH_HOST` | Server hostname/IP | Custom Server Deployment |

## 📝 How to Add Secrets

1. Go to your repository on GitHub.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Enter the name and value from the table above.
5. Click **Add secret**.
