# recruta.ai — Frontend

Interface web do painel de candidatos. Exibe, filtra e gerencia os currículos enviados ao bot.

---

## Estrutura

```
frontend/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css         # Estilos e design tokens
│   └── js/
│       ├── config.js         # API URL, cores, ranking, vagas
│       ├── state.js          # Estado global (candidates, status, vaga ativa)
│       ├── helpers.js        # Funções utilitárias (capitalize, initials, skills)
│       ├── api.js            # Fetch de candidatos e loading
│       ├── render.js         # Render da lista, stats e página de selecionados
│       ├── filters.js        # Busca, ordenação e filtro por vaga
│       ├── status.js         # Gerenciamento de status (entrevista/contratado)
│       └── modal.js          # Modal de detalhes e dialog de confirmação
└── README.md
```

---

## Funcionalidades

### Painel de Candidatos
- Cards de estatísticas: total, % classificados como Ótimo e candidato com maior nota
- Listagem com nome, e-mail, skills (máx. 4 visíveis + badge `+N`), score e ranking
- Nomes sempre exibidos em formato capitalizado independente do backend
- Busca em tempo real por nome, e-mail ou skill
- Ordenação por score (crescente/decrescente) ou nome
- Filtro por vaga com 37 áreas do mercado — colapsável
- Modal de detalhes com todas as informações do candidato

### Aba Selecionados
- Fila de candidatos para entrevista
- Fila de candidatos contratados
- Botão de entrevista compacto (ícone) em cada linha da listagem
- Contratar move o candidato de entrevistas para contratados
- Botão de remover em ambas as listas
- Status salvo no `localStorage`

### Confirmações
- Dialog de confirmação em todas as ações destrutivas
- Cores por tipo: roxo (entrevista), verde (contratar), vermelho (remover)
- Fecha com ESC ou clique fora

---

## Como rodar localmente

Abra o `index.html` diretamente no navegador ou use o **Live Server** no VS Code:

1. Instale [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Clique com o botão direito em `index.html` → **Open with Live Server**

---

## Conectar ao backend

A URL da API está em `assets/js/config.js`:

```js
const API_BASE = "https://curriculum-bot-ranker.onrender.com";
const API_URL  = `${API_BASE}/candidates/`;
```

### Formato esperado da resposta

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

### Valores válidos para `ranking_level`

| Valor     | Exibição | Cor    |
|-----------|----------|--------|
| `ÓTIMO`   | Ótimo    | Verde  |
| `BOM`     | Bom      | Âmbar  |
| `MEDIANO` | Mediano  | Âmbar  |
| `REGULAR` | Regular  | Lilás  |
| `FRACO`   | Fraco    | Vermelho |

---

## Filtro por vaga

O array `VAGAS` em `config.js` tem 37 áreas com keywords. Para adicionar uma nova:

```js
{ label: "Nome da Vaga", keywords: ["keyword1", "keyword2"] },
```

O filtro cruza as keywords com `skills` e `ai_summary` do candidato.

---

## Estado local (localStorage)

| Chave             | Conteúdo                              |
|-------------------|---------------------------------------|
| `candidateStatus` | Status de cada candidato (entrevista/contratado) |

Persiste ao fechar o navegador mas não sincroniza entre usuários. Quando o backend tiver endpoints de status, substituir `setStatus` e `removeStatus` em `status.js`.
