import json
import uuid
from airflow.providers.google.cloud.hooks.gcs import GCSHook
from airflow.providers.postgres.hooks.postgres import PostgresHook


def load_gold_to_pg(bucket_name, source_blob_name):
    gcs_hook = GCSHook(gcp_conn_id="google_cloud_default")
    pg_hook = PostgresHook(postgres_conn_id="postgres_default")

    file_content = gcs_hook.download(
        bucket_name=bucket_name, object_name=source_blob_name
    )
    data = json.loads(file_content.decode("utf-8"))

    candidate_id = str(uuid.uuid4())
    full_name = data.get("nome", "N/A")
    email = data.get("email", "N/A")
    phone = data.get("telefone", "N/A")

    skills_formatadas = (
        ", ".join(data.get("skills", []))
        if isinstance(data.get("skills"), list)
        else str(data.get("skills", ""))
    )

    resumo_ia_provisorio = f"Skills extraídas: {skills_formatadas} | Anos de exp: {data.get('anos_experiencia', 0)}"

    insert_query = """
        INSERT INTO candidates 
        (id, full_name, email, phone, pdf_file_name, pdf_storage_url, ai_summary)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    try:
        pg_hook.run(
            insert_query,
            parameters=(
                candidate_id,
                full_name,
                email,
                phone,
                source_blob_name.split("/")[-1],
                f"gs://{bucket_name}/{source_blob_name}",
                resumo_ia_provisorio,
            ),
        )
        print(f"Sucesso: Candidato {full_name} inserido na nova tabela do PostgreSQL!")
    except Exception as e:
        print(f"Erro ao inserir no banco: {e}")
        raise e
