from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_mLwgSXK8v1Uo@ep-polished-cake-ac4gqqx2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Verificar candidatos
    result = conn.execute(text("SELECT COUNT(*) FROM candidates"))
    count = result.scalar()
    print(f"Total de candidatos na tabela candidates: {count}")
    
    if count > 0:
        result = conn.execute(text("SELECT id, full_name, pdf_file_name FROM candidates"))
        print("\nCandidatos:")
        for row in result:
            print(f"ID: {row[0]}, Nome: {row[1]}, PDF: {row[2]}")
