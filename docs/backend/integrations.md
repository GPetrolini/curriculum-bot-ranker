# Backend / Integrações

Esta página detalha a integração com OpenAI utilizada pelo backend.

## Cliente OpenAI

Arquivo: `src/clients/openai_client.py`

A função `analyze_resume_text()` monta o prompt e chama o modelo `gpt-4o-mini`:

```python
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
```

Em seguida, o código tenta fazer `json.loads(content)`. Se a resposta não for JSON válido, ele extrai o primeiro objeto JSON do texto:

```python
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
```

## Configuração

- A variável `OPENAI_API_KEY` deve ser definida em `src/config/settings.py`.
- O cliente OpenAI é inicializado com `OpenAI(api_key=settings.OPENAI_API_KEY)`.
