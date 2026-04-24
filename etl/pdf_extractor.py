import os
import pdfplumber
from airflow.providers.google.cloud.hooks.gcs import GCSHook


def process_cv_bronze_to_silver(bucket_name, source_blob_name):
    """
    Baixa o PDF da camada Bronze, extrai o texto e salva na camada Silver (texto limpo).
    """
    gcs_hook = GCSHook(gcp_conn_id="google_cloud_default")

    nome_arquivo = source_blob_name.split("/")[-1]
    temp_pdf_path = f"/tmp/{nome_arquivo}"
    temp_txt_path = temp_pdf_path.replace(".pdf", ".txt")

    print(f"📥 Baixando {source_blob_name} do GCP...")
    gcs_hook.download(
        bucket_name=bucket_name, object_name=source_blob_name, filename=temp_pdf_path
    )

    print("Extraindo texto do PDF...")
    texto_extraido = ""
    with pdfplumber.open(temp_pdf_path) as pdf:
        for page in pdf.pages:
            texto = page.extract_text()
            if texto:
                texto_extraido += texto + "\n"

    with open(temp_txt_path, "w", encoding="utf-8") as f:
        f.write(texto_extraido)

    destino_blob_name = f"silver/curriculos_txt/{nome_arquivo.replace('.pdf', '.txt')}"
    print(f"Fazendo upload do texto extraído para {destino_blob_name}...")
    gcs_hook.upload(
        bucket_name=bucket_name, object_name=destino_blob_name, filename=temp_txt_path
    )

    os.remove(temp_pdf_path)
    os.remove(temp_txt_path)
    print("Processamento da camada Silver concluído com sucesso!")
