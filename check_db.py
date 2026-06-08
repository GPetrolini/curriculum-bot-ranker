from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_mLwgSXK8v1Uo@ep-polished-cake-ac4gqqx2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Verificar tabelas
    result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
    tables = [row[0] for row in result]
    print("Tabelas no banco:", tables)
    
    # Verificar se raw_resumes existe
    if 'raw_resumes' in tables:
        result = conn.execute(text("SELECT COUNT(*) FROM raw_resumes"))
        count = result.scalar()
        print(f"Registros em raw_resumes: {count}")
        
        if count > 0:
            result = conn.execute(text("SELECT id, file_name, status FROM raw_resumes"))
            for row in result:
                print(f"ID: {row[0]}, Nome: {row[1]}, Status: {row[2]}")
    else:
        print("Tabela raw_resumes não existe")
