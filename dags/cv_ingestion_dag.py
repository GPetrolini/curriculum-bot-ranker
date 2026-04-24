from airflow import DAG
from airflow.operators.python import PythonOperator
import pendulum

from etl.gcp_upload import upload_raw_cvs_to_gcs
from etl.pdf_extractor import process_cv_bronze_to_silver
from etl.gemini_extractor import extract_entities_with_gemini

GCP_CONN_ID = "google_cloud_default"
BUCKET_NAME = "cv-ranker-data-lake"
LOCAL_RAW_DIR = "/opt/airflow/data/raw"
LOCAL_ARCHIVE_DIR = "/opt/airflow/data/archive"


def run_bronze_to_silver(**context):
    from airflow.providers.google.cloud.hooks.gcs import GCSHook

    gcs_hook = GCSHook(gcp_conn_id=GCP_CONN_ID)
    arquivos_bronze = gcs_hook.list(bucket_name=BUCKET_NAME, prefix="raw/curriculos/")
    if not arquivos_bronze:
        return

    for arquivo in arquivos_bronze:
        if arquivo.endswith(".pdf"):
            process_cv_bronze_to_silver(
                bucket_name=BUCKET_NAME, source_blob_name=arquivo
            )


def run_silver_to_gold(**context):
    from airflow.providers.google.cloud.hooks.gcs import GCSHook
    import time

    gcs_hook = GCSHook(gcp_conn_id=GCP_CONN_ID)
    arquivos_silver = gcs_hook.list(
        bucket_name=BUCKET_NAME, prefix="silver/curriculos_txt/"
    )

    if not arquivos_silver:
        return

    for arquivo in arquivos_silver:
        if arquivo.endswith(".txt"):
            extract_entities_with_gemini(
                bucket_name=BUCKET_NAME, source_blob_name=arquivo
            )

            time.sleep(15)


with DAG(
    dag_id="01_ingestao_raw_cvs",
    start_date=pendulum.datetime(2026, 4, 1, tz="America/Sao_Paulo"),
    schedule_interval="@daily",
    catchup=False,
    tags=["cv_ranker", "ingestion", "gcp", "ai"],
    doc_md="""
    ### DAG de Ingestão de Currículos, Extração e Estruturação IA
    Esta DAG varre a pasta local `data/raw`, identifica novos currículos e faz o upload para o GCP. 
    Em seguida, extrai o texto (Silver) e aciona a API do Gemini para estruturação em JSON (Gold).
    """,
) as dag:

    task_upload_gcs = PythonOperator(
        task_id="upload_raw_cvs_to_gcs",
        python_callable=upload_raw_cvs_to_gcs,
        op_kwargs={
            "gcp_conn_id": GCP_CONN_ID,
            "bucket_name": BUCKET_NAME,
            "local_folder": LOCAL_RAW_DIR,
            "archive_folder": LOCAL_ARCHIVE_DIR,
        },
    )

    task_extract_silver = PythonOperator(
        task_id="extract_text_bronze_to_silver",
        python_callable=run_bronze_to_silver,
    )

    task_extract_gold = PythonOperator(
        task_id="extract_entities_silver_to_gold",
        python_callable=run_silver_to_gold,
    )

    task_upload_gcs >> task_extract_silver >> task_extract_gold
