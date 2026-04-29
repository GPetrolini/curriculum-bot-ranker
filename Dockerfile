FROM apache/airflow:2.8.1-python3.11

RUN pip install --no-cache-dir \
    pdfplumber==0.11.0 \
    google-generativeai==0.8.3 \
    psycopg2-binary==2.9.9 \
    sqlalchemy==1.4.49 \
    python-dotenv==1.0.1