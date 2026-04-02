resource "google_storage_bucket" "datalake" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_bigquery_dataset" "analytics_dataset" {
  dataset_id                  = var.dataset_id
  friendly_name               = "CV Ranker Analytics"
  description                 = "Dataset contendo tabelas consolidadas extraidas do Postgres via Airflow"
  location                    = var.region
  delete_contents_on_destroy  = true
}