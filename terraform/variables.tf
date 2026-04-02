variable "project_id" {
  type        = string
}

variable "region" {
  type        = string
  default     = "us-central1"
}

variable "dataset_id" {
  type        = string
  default     = "cv_ranker_analytics"
}

variable "bucket_name" {
  type        = string
}