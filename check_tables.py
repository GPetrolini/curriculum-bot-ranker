import sys
from database.connection import engine
from sqlalchemy import text

sys.path.insert(0, 'src')

with engine.connect() as conn:
    result = conn.execute(
        text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    )
    tables = [row[0] for row in result]
    print("Tabelas no banco:", tables)

    if 'candidates' in tables:
        print("Tabela candidates existe")
        result = conn.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'candidates'")
        )
        columns = [row[0] for row in result]
        print("Colunas da candidates:", columns)

        # Verificar se as colunas específicas existem
        if 'select_for_interview' in [c.lower() for c in columns]:
            print("Coluna select_for_interview existe")
        else:
            print("Coluna select_for_interview NÃO existe")

        if 'interview_select_atc' in [c.lower() for c in columns]:
            print("Coluna interview_select_atc existe")
        else:
            print("Coluna interview_select_atc NÃO existe")
    else:
        print("Tabela candidates NÃO existe")
