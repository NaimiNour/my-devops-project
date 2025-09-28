#nfsat.tf
# Configure Terraform and providers
terraform {
  required_version = ">= 1.0"
  required_providers {
    b2 = {
      source  = "Backblaze/b2"
      version = "~> 0.8"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"  
      version = "~> 2.23"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

# Variables - make configuration flexible
variable "project_name" {
  description = "Name of the project - used for naming resources"
  type        = string
  default     = "my-api"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "b2_application_key_id" {
  description = "Backblaze B2 Application Key ID"
  type        = string
  sensitive   = true
}

variable "b2_application_key" {
  description = "Backblaze B2 Application Key"  
  type        = string
  sensitive   = true
}

# Configure Backblaze B2 provider
provider "b2" {
  application_key_id = var.b2_application_key_id
  application_key    = var.b2_application_key
}

# Configure Kubernetes provider (using your existing minikube)
provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Create B2 bucket for application files
resource "b2_bucket" "app_files" {
  bucket_name = "${var.project_name}-files-${var.environment}"
  bucket_type = "allPrivate"
  
  # Lifecycle rules - automatically clean up old files
  lifecycle_rules {
    file_name_prefix = "temp/"
    days_from_hiding_to_deleting = 1
    days_from_uploading_to_hiding = 7
  }
  
  # CORS rules - allow web access if needed
  cors_rules {
    cors_rule_name = "downloadFromAnyOrigin"
    allowed_origins = ["*"]
    allowed_headers = ["*"] 
    allowed_operations = ["b2_download_file_by_id", "b2_download_file_by_name"]
    max_age_seconds = 3600
  }
}

# Create B2 bucket for backups
resource "b2_bucket" "backups" {
  bucket_name = "${var.project_name}-backups-${var.environment}"
  bucket_type = "allPrivate"
  
  # Longer retention for backups
  lifecycle_rules {
    file_name_prefix = "daily/"
    days_from_hiding_to_deleting = 7
    days_from_uploading_to_hiding = 30
  }
  
  lifecycle_rules {
    file_name_prefix = "weekly/"
    days_from_hiding_to_deleting = 30
    days_from_uploading_to_hiding = 90
  }
}

# Create B2 application key for the app (limited permissions)
resource "b2_application_key" "app_key" {
  key_name  = "${var.project_name}-app-key-${var.environment}"
  bucket_id = b2_bucket.app_files.bucket_id
  
  # Minimal required permissions
  capabilities = [
    "listFiles",
    "readFiles", 
    "shareFiles",
    "writeFiles"
  ]
}

# Create Kubernetes namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = "${var.project_name}-${var.environment}"
    
    labels = {
      name = "${var.project_name}-${var.environment}"
      environment = var.environment
      managed_by = "terraform"
    }
  }
}

# Create Kubernetes secret with B2 credentials
resource "kubernetes_secret" "b2_credentials" {
  metadata {
    name      = "${var.project_name}-b2-credentials"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  
  data = {
    B2_APP_KEY_ID   = b2_application_key.app_key.application_key_id
    B2_APP_KEY      = b2_application_key.app_key.application_key
    B2_BUCKET_ID    = b2_bucket.app_files.bucket_id
    B2_BUCKET_NAME  = b2_bucket.app_files.bucket_name
  }
  
  type = "Opaque"
}

# Create Kubernetes configmap
resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "${var.project_name}-config"
    namespace = kubernetes_namespace.app.metadata[0].name
  }
  
  data = {
    NODE_ENV = "production"
    PORT     = "3000"
    ENVIRONMENT = var.environment
    VERSION  = "terraform-managed"
  }
}

# Outputs - show important information
output "b2_app_files_bucket" {
  description = "B2 bucket for application files"
  value = {
    id   = b2_bucket.app_files.bucket_id
    name = b2_bucket.app_files.bucket_name
    url  = "https://f002.backblazeb2.com/file/${b2_bucket.app_files.bucket_name}/"
  }
}

output "b2_backups_bucket" {
  description = "B2 bucket for backups" 
  value = {
    id   = b2_bucket.backups.bucket_id
    name = b2_bucket.backups.bucket_name
  }
}

output "kubernetes_namespace" {
  description = "Kubernetes namespace created"
  value       = kubernetes_namespace.app.metadata[0].name
}

output "b2_app_key_info" {
  description = "B2 application key for the app (sensitive)"
  value = {
    key_id = b2_application_key.app_key.application_key_id
    key    = b2_application_key.app_key.application_key
  }
  sensitive = true
}
