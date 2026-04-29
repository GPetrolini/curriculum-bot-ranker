from __future__ import annotations
import os
import pendulum
from airflow import DAG
from airflow.decorators import task
from airflow.providers.google.cloud.transfers.local_to_gcs import (
    LocalFilesystemToGCSOperator,
)
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import (
    GCSToBigQueryOperator,
)
from etl.postgres_to_csv import export_table_to_csv

GCP_CONN_ID = "google_cloud_default"
BUCKET_NAME = "cv-ranker-data-lake"
PROJECT_ID = "cv-ranker-app"
DATASET_ID = "cv_ranker_analytics"
STAGING_PATH = "/opt/airflow/data/staging"

tabelas_origem = ["candidates", "jobs", "rankings", "curriculos_estruturados"]

with DAG(
    dag_id="02_carga_analytics_bq",
    start_date=pendulum.datetime(2026, 4, 1, tz="America/Sao_Paulo"),
    schedule_interval="0 2 * * *",
    catchup=False,
    tags=["cv_ranker", "analytics", "gcp"],
) as dag:

    for tabela in tabelas_origem:

        @task(task_id=f"extrair_{tabela}")
        def task_extrai(nome_tabela):
            destino = os.path.join(STAGING_PATH, nome_tabela)
            return export_table_to_csv(nome_tabela, destino)

        arquivo_local = task_extrai(tabela)

        upload_gcs = LocalFilesystemToGCSOperator(
            task_id=f"upload_{tabela}_to_gcs",
            src=arquivo_local,
            dst=f"analytics/{tabela}/{{{{ ds }}}}.csv",
            bucket=BUCKET_NAME,
            gcp_conn_id=GCP_CONN_ID,
        )

        load_bq = GCSToBigQueryOperator(
            task_id=f"load_{tabela}_to_bq",
            bucket=BUCKET_NAME,
            source_objects=[f"analytics/{tabela}/{{{{ ds }}}}.csv"],
            destination_project_dataset_table=f"{PROJECT_ID}.{DATASET_ID}.{tabela}",
            source_format="CSV",
            skip_leading_rows=1,
            write_disposition="WRITE_TRUNCATE",
            autodetect=True,
            gcp_conn_id=GCP_CONN_ID,
        )

        @task(task_id=f"limpar_local_{tabela}")
        def task_limpa(caminho_arquivo):
            if os.path.exists(caminho_arquivo):
                os.remove(caminho_arquivo)
                print(f"Limpeza concluída: {caminho_arquivo}")

        upload_gcs >> load_bq >> task_limpa(arquivo_local)
