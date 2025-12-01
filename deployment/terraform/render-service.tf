# Render Service Terraform Configuration
# Provider: render-oss/render v1.3.x
# Docs: https://registry.terraform.io/providers/render-oss/render/latest/docs

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3.0"
    }
  }
}

# Configure the Render Provider
provider "render" {
  api_key = var.render_api_key
}

# Variables
variable "render_api_key" {
  description = "Render API Key for authentication"
  type        = string
  sensitive   = true
}

variable "service_name" {
  description = "Name of the web service"
  type        = string
  default     = "jules-orchestrator"
}

variable "repo_url" {
  description = "Git repository URL"
  type        = string
}

variable "branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "health_check_path" {
  description = "Health check endpoint path"
  type        = string
  default     = "/api/v1/health"
}

variable "google_credentials_json" {
  description = "Google Application Credentials JSON"
  type        = string
  sensitive   = true
  default     = ""
}

# Web Service Resource - Using correct render-oss/render schema
resource "render_web_service" "app" {
  name   = var.service_name
  plan   = "starter"
  region = "oregon"

  # Runtime source configuration (required)
  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = var.branch
      build_command = "npm install && npm run build"
      build_filter = {
        paths         = ["src/**", "package.json"]
        ignored_paths = ["node_modules/**", "*.md"]
      }
      repo_url      = var.repo_url
      runtime       = "node"
      start_command = "npm start"
    }
  }

  # Environment Variables (correct format: list of objects)
  env_vars = [
    {
      key   = "NODE_ENV"
      value = "production"
    },
    {
      key   = "PORT"
      value = "10000"
    },
    {
      key   = "HEALTH_CHECK_PATH"
      value = var.health_check_path
    }
  ]

  # Secret files (correct format: list of objects)
  secret_files = var.google_credentials_json != "" ? [
    {
      name    = "google-credentials"
      content = var.google_credentials_json
    }
  ] : []

  # Notification settings
  notification_override = {
    preview_notifications_enabled = "true"
    notifications_to_send         = "all"
  }
}

# Output the service URL
output "service_url" {
  description = "The URL of the deployed service"
  value       = render_web_service.app.url
}

output "service_id" {
  description = "The Render service ID"
  value       = render_web_service.app.id
}
