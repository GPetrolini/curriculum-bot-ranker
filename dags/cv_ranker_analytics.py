from __future__ import annotations
import os
import pandas as pd
from airflow import DAG
from airflow.decorators import task
from airflow.providers.postgres.hooks.postgres import PostgresHook
import pendulum
from datetime import datetime

tabelas_origem = ["candidates", "jobs", "rankings"]
pasta_staging = "/opt/airflow/data/staging"

with DAG(
    dag_id="cv_ranker_to_gcp_pipeline",
    start_date=pendulum.datetime(2026, 4, 1, tz="America/Sao_Paulo"),
    schedule_interval="0 2 * * *",
    catchup=False,
    tags=["cv_ranker", "etl", "gcp"],
    doc_md="""
    ### CV Ranker Analytics Pipeline
    DAG responsável por extrair dados transacionais do Postgres local e preparar para o BigQuery (GCP).
    
    **Tasks:**
    - `extracao_tabela_<tabela>`: Lê as tabelas do backend e salva em CSV no Staging local.
    - `carrega_bigquery_<tabela>`: (A ser implementada) Envia os dados para o GCP.
    """,
) as dag:

    def criar_task_extracao(tabela: str):
        @task(task_id=f"extracao_tabela_{tabela}")
        def extrai_tabela(nome_tabela: str, destino: str) -> str:
            os.makedirs(destino, exist_ok=True)
            pg_hook = PostgresHook(postgres_conn_id="cv_ranker_db_conn")
            
            query = f"SELECT * FROM {nome_tabela};"
            df = pg_hook.get_pandas_df(query)
            
            arquivo_csv = os.path.join(destino, f"{nome_tabela}_{datetime.now().strftime('%Y%m%d')}.csv")
            df.to_csv(arquivo_csv, index=False)
            
            print(f"Extração da tabela {nome_tabela} concluída com sucesso: {arquivo_csv}")
            return arquivo_csv
        
        return extrai_tabela

    def criar_task_load_gcp(tabela: str):
        @task(task_id=f"prepara_load_gcp_{tabela}")
        def load_gcp(arquivo_csv: str):
            print(f"Preparando envio do arquivo {arquivo_csv} para o BigQuery...")
            # TODO:
            
        return load_gcp

    for tabela in tabelas_origem:
        pasta_destino = os.path.join(pasta_staging, "{{ ds }}")
        
        task_extrai = criar_task_extracao(tabela)(nome_tabela=tabela, destino=pasta_destino)
        task_load = criar_task_load_gcp(tabela)(arquivo_csv=task_extrai)
        
        task_extrai >> task_load