import os
import shutil
from airflow.providers.google.cloud.hooks.gcs import GCSHook

def upload_raw_cvs_to_gcs(gcp_conn_id: str, bucket_name: str, local_folder: str, archive_folder: str):
    """
    Varre a pasta local, faz o upload dos PDFs para o GCS e move para a pasta de arquivo.
    """
    os.makedirs(local_folder, exist_ok=True)
    os.makedirs(archive_folder, exist_ok=True)

    hook = GCSHook(gcp_conn_id=gcp_conn_id)
    
    arquivos = [f for f in os.listdir(local_folder) if f.endswith('.pdf') or f.endswith('.docx')]
    
    if not arquivos:
        print("Nenhum currículo novo encontrado para processar.")
        return "Nenhum arquivo processado."

    arquivos_enviados = 0

    for arquivo in arquivos:
        caminho_local = os.path.join(local_folder, arquivo)
        caminho_destino_gcs = f"raw/curriculos/{arquivo}"
        
        print(f"Iniciando upload de: {arquivo}")
        
        hook.upload(
            bucket_name=bucket_name,
            object_name=caminho_destino_gcs,
            filename=caminho_local
        )
        
        caminho_arquivo_morto = os.path.join(archive_folder, arquivo)
        shutil.move(caminho_local, caminho_arquivo_morto)
        
        print(f"Sucesso! {arquivo} enviado para GCS e movido para archive.")
        arquivos_enviados += 1

    return f"{arquivos_enviados} arquivos enviados com sucesso."