import os
import pandas as pd
from datetime import datetime
from airflow.providers.postgres.hooks.postgres import PostgresHook

def export_table_to_csv(nome_tabela: str, destino: str, conn_id: str = "cv_ranker_db_conn") -> str:
    """
    Conecta no Postgres, extrai a tabela e salva como CSV na pasta de staging.
    """
    os.makedirs(destino, exist_ok=True)
    
    pg_hook = PostgresHook(postgres_conn_id=conn_id)
    
    query = f"SELECT * FROM {nome_tabela};"
    
    df = pg_hook.get_pandas_df(query)
    
    arquivo_csv = os.path.join(destino, f"{nome_tabela}_{datetime.now().strftime('%Y%m%d')}.csv")
    df.to_csv(arquivo_csv, index=False)
    
    print(f"Extração da tabela {nome_tabela} concluída com sucesso: {arquivo_csv}")
    
    return arquivo_csv