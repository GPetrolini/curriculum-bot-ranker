from openai import OpenAI
from src.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def analyze_resume_text(text: str):
    prompt = f"""
Extraia as seguintes informações do currículo abaixo e retorne em JSON:

- nome
- email
- telefone
- resumo profissional
- skills (lista)
- anos de experiência

Currículo:
{text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Você é um especialista em recrutamento."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content