# Add a new bucket for logs  
resource "b2_bucket" "logs" {
  bucket_name = "${var.project_name}-logs-${var.environment}"
  bucket_type = "allPrivate"
  
  # Short retention for logs
  lifecycle_rules {
    file_name_prefix = ""
    days_from_hiding_to_deleting = 7
    days_from_uploading_to_hiding = 30
  }
}

output "b2_logs_bucket" {
  description = "B2 bucket for logs"
  value = {
    id   = b2_bucket.logs.bucket_id
    name = b2_bucket.logs.bucket_name
  }
}
