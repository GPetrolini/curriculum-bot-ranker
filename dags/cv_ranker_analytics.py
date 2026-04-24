from __future__ import annotations
import os
from airflow import DAG
from airflow.decorators import task
import pendulum

from etl.postgres_to_csv import export_table_to_csv

tabelas_origem = ["candidates", "jobs", "rankings"]
pasta_staging = "/opt/airflow/data/staging"

with DAG(
    dag_id="cv_ranker_to_gcp_pipeline",
    start_date=pendulum.datetime(2026, 4, 1, tz="America/Sao_Paulo"),
    schedule_interval="0 2 * * *",
    catchup=False,
    tags=["cv_ranker", "etl", "gcp", "analytics"],
    doc_md="""
    ### CV Ranker Analytics Pipeline
    DAG responsável por extrair dados transacionais do Postgres local e preparar para o BigQuery (GCP).
    """,
) as dag:

    def criar_task_extracao(tabela: str):
        @task(task_id=f"extracao_tabela_{tabela}")
        def extrai_tabela_task(nome_tabela: str, destino: str) -> str:
            return export_table_to_csv(nome_tabela, destino)

        return extrai_tabela_task

    def criar_task_load_gcp(tabela: str):
        @task(task_id=f"prepara_load_gcp_{tabela}")
        def load_gcp_task(arquivo_csv: str):
            print(f"Preparando envio do arquivo {arquivo_csv} para o BigQuery...")
            # TODO:

        return load_gcp_task

    for tabela in tabelas_origem:
        pasta_destino = os.path.join(pasta_staging, "{{ ds }}")

        task_extrai = criar_task_extracao(tabela)(
            nome_tabela=tabela, destino=pasta_destino
        )
        task_load = criar_task_load_gcp(tabela)(arquivo_csv=task_extrai)

        task_extrai >> task_load
