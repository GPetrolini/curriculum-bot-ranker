import json
from airflow.providers.google.cloud.hooks.gcs import GCSHook
from airflow.providers.postgres.hooks.postgres import PostgresHook

def load_gold_to_pg(bucket_name, source_blob_name):
    gcs_hook = GCSHook(gcp_conn_id="google_cloud_default")
    pg_hook = PostgresHook(postgres_conn_id="postgres_default")
    
    file_content = gcs_hook.download(bucket_name=bucket_name, object_name=source_blob_name)
    data = json.loads(file_content.decode('utf-8'))
    
    skills_formatadas = ", ".join(data.get("skills", [])) if isinstance(data.get("skills"), list) else str(data.get("skills", ""))
    
    insert_query = """
        INSERT INTO curriculos_estruturados 
        (nome, email, telefone, skills, anos_experiencia, arquivo_origem)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    try:
        pg_hook.run(insert_query, parameters=(
            data.get("nome", "N/A"),
            data.get("email", "N/A"),
            data.get("telefone", "N/A"),
            skills_formatadas,
            int(data.get("anos_experiencia", 0)),
            source_blob_name
        ))
        print(f"Sucesso: Dados do arquivo {source_blob_name} inseridos no PostgreSQL!")
    except Exception as e:
        print(f"Erro ao inserir no banco: {e}")
        raise e