import os
from airflow.providers.postgres.hooks.postgres import PostgresHook


def export_table_to_csv(
    nome_tabela: str, destino: str, conn_id: str = "postgres_default"
) -> str:
    """
    Extrai dados do Postgres e salva em CSV de forma compatível com a DAG de Analytics.
    """
    os.makedirs(destino, exist_ok=True)

    pg_hook = PostgresHook(postgres_conn_id=conn_id)

    query = f"SELECT * FROM {nome_tabela};"
    df = pg_hook.get_pandas_df(query)

    arquivo_csv = os.path.join(destino, f"{nome_tabela}.csv")

    df.to_csv(arquivo_csv, index=False)

    print(f"Arquivo gerado para {nome_tabela}: {arquivo_csv}")
    return arquivo_csv
