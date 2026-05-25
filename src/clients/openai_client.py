import json
from openai import OpenAI
from config.settings import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def analyze_resume_text(text: str):
    prompt = f"""
Você é um especialista em recrutamento.
Extraia as partes mais importantes do currículo abaixo e responda em JSON válido.

Retorne as seguintes chaves:
- "summary": breve resumo profissional focado em experiência e resultados
- "skills": lista das principais habilidades técnicas e comportamentais
- "experience_years": anos de experiência profissional
- "top_experiences": lista curta com os cargos ou projetos mais relevantes

Currículo:
{text}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Você é um especialista em recrutamento."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=500,
        temperature=0.2,
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(content[start:end + 1])
            except json.JSONDecodeError:
                pass
        return {"raw_response": content.strip()}
