import time
import logging
import requests
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_URL = os.getenv("API_URL", "http://localhost:8000/process")


def trigger_processing() -> dict:
    try:
        logger.info("Disparando processamento de PDFs via API...")
        response = requests.post(API_URL, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Processamento concluído: {result}")
            return result
        else:
            logger.error(f"Erro na API: Status {response.status_code}")
            return {"error": f"API returned status {response.status_code}"}
    except requests.exceptions.RequestException as exc:
        logger.error(f"Erro ao chamar API: {exc}")
        return {"error": str(exc)}


def run_background_worker(interval: int = 30):
    logger.info("Iniciando background worker para processamento de PDFs...")
    logger.info(f"Intervalo de verificação: {interval} segundos")
    
    while True:
        try:
            result = trigger_processing()
            if "error" not in result:
                processed = result.get("processed", 0)
                if processed > 0:
                    logger.info(f"Processamento concluído: {processed} PDFs processados")
            
            time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Background worker interrompido pelo usuário")
            break
        except Exception as exc:
            logger.error(f"Erro no background worker: {exc}")
            time.sleep(interval)


if __name__ == "__main__":
    import os
    interval = int(os.getenv("BACKGROUND_WORKER_INTERVAL", "30"))
    run_background_worker(interval)
