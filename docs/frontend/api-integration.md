# Integração com o Backend

## Endpoint consumido

```
GET /candidates/
```

Retorna a lista completa de candidatos ranqueados.

---

## Payload de resposta

```json
{
  "candidates": [
    {
      "candidate_id": "uuid-aqui",
      "full_name": "NOME COMPLETO",
      "email": "email@dominio.com",
      "phone": "+5511999999999",
      "ai_summary": "Resumo gerado pela IA.",
      "ai_seniority": 5,
      "skills": ["python", "sql", "airflow"],
      "final_score": 78.5,
      "ranking_level": "BOM"
    }
  ]
}
```

### Campos utilizados pelo frontend

| Campo | Tipo | Onde é usado |
|---|---|---|
| `candidate_id` | `string (uuid)` | Chave primária para estado, eventos e localStorage |
| `full_name` | `string` | Nome exibido (capitalizado automaticamente) |
| `email` | `string` | Listagem e modal |
| `phone` | `string` | Modal |
| `ai_summary` | `string` | Modal e filtro por vaga |
| `ai_seniority` | `number` | Modal (anos de experiência) |
| `skills` | `string[]` | Tags na listagem, modal e filtro por vaga |
| `final_score` | `number` | Score 0–100, usado em ordenação e exibição |
| `ranking_level` | `string` | Nível de classificação — ver tabela abaixo |

### Valores válidos para `ranking_level`

| Valor | Label exibido | Cor |
|---|---|---|
| `"ÓTIMO"` | Ótimo | Verde |
| `"BOM"` | Bom | Âmbar |
| `"REGULAR"` | Regular | Lilás |
| `"FRACO"` | Fraco | Vermelho |

Valores não mapeados recebem fallback para `badge-low` (lilás) sem quebrar a interface.

---

## Estado local

O frontend não possui endpoints de escrita ainda. O status dos candidatos é mantido exclusivamente no `localStorage`.

| Chave | Tipo | Conteúdo |
|---|---|---|
| `candidateStatus` | `JSON` | `{ [candidate_id]: "entrevista" \| "contratado" }` |

O estado persiste ao fechar o navegador, mas **não sincroniza entre usuários ou dispositivos**.

### Migração futura

Quando o backend implementar endpoints de status, substituir o corpo de `setStatus()` e `removeStatus()` em `status.js` por chamadas à API — as assinaturas das funções podem ser mantidas.
