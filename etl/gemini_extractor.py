import os
import json
import google.generativeai as genai
from airflow.providers.google.cloud.hooks.gcs import GCSHook
from dotenv import load_dotenv


def extract_entities_with_gemini(bucket_name, source_blob_name):
    gcs_hook = GCSHook(gcp_conn_id="google_cloud_default")

    file_name = source_blob_name.split("/")[-1]
    temp_txt_path = f"/tmp/{file_name}"

    gcs_hook.download(
        bucket_name=bucket_name, object_name=source_blob_name, filename=temp_txt_path
    )

    with open(temp_txt_path, "r", encoding="utf-8") as f:
        texto_curriculo = f.read()

    load_dotenv(dotenv_path="/opt/airflow/.env")

    api_key = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    Analise o texto do currículo abaixo e retorne APENAS um JSON válido.
    Não adicione blocos de código ou formatação markdown, retorne apenas o JSON bruto.
    As chaves obrigatórias devem ser: "nome", "email", "telefone", "skills" e "anos_experiencia".
    Texto: {texto_curriculo}
    """

    try:
        response = model.generate_content(prompt)
        resultado_limpo = (
            response.text.replace("```json", "").replace("```", "").strip()
        )

        json.loads(resultado_limpo)

        temp_json_path = temp_txt_path.replace(".txt", ".json")
        with open(temp_json_path, "w", encoding="utf-8") as f:
            f.write(resultado_limpo)

        destino_blob_name = f"gold/curriculos_json/{file_name.replace('.txt', '.json')}"
        gcs_hook.upload(
            bucket_name=bucket_name,
            object_name=destino_blob_name,
            filename=temp_json_path,
        )

        if os.path.exists(temp_json_path):
            os.remove(temp_json_path)
    except Exception as e:
        print(f"Erro na IA: {e}")
        raise e
    finally:
        if os.path.exists(temp_txt_path):
            os.remove(temp_txt_path)
