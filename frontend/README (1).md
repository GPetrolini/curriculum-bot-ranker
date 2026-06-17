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
│       ├── config.js         # API URL, cores, RANKING_MAP e array VAGAS
│       ├── state.js          # Estado global (candidates, paginação, vaga ativa)
│       ├── helpers.js        # Utilitários: capitalize, initials, skills, ranking
│       ├── api.js            # Fetch de candidatos, loading e label de atualização
│       ├── render.js         # Render da lista, stats, paginação e selecionados
│       ├── filters.js        # Busca, ordenação e filtro por vaga
│       ├── status.js         # Gerenciamento de status (entrevista/contratado)
│       └── modal.js          # Modal de detalhes e dialogs de confirmação
└── README.md
```

---

## Funcionalidades

### Painel de Candidatos
- Cards de estatísticas: total de candidatos, % classificados como Excelente e candidato com maior nota
- Listagem com nome, e-mail, skills (máx. 4 visíveis + badge `+N`), score e ranking
- Nomes sempre capitalizados independente de como chegam do backend
- Paginação de 15 candidatos por página com navegação por número de página
- Botão **Atualizar** com label "Atualizado há Xs" para refresh manual dos dados
- Busca em tempo real por nome, e-mail ou skill
- Ordenação por score (crescente/decrescente), nome ou anos de experiência
- Filtro por vaga com 37 áreas do mercado — colapsável, com pill de vaga ativa visível
- Modal de detalhes com todas as informações do candidato
- Contador de resultados ("Exibindo X de Y candidatos") quando filtros estão ativos

### Aba Selecionados
- Fila de candidatos chamados para entrevista
- Fila de candidatos contratados
- Botão de entrevista compacto (ícone) com tooltip em cada linha da listagem
- Contratar move o candidato da fila de entrevistas para contratados
- Botão de remover em ambas as listas
- Status persistido no `localStorage`

### Confirmações
- Dialog de confirmação em todas as ações: marcar entrevista, contratar e remover
- Cores por tipo de ação: roxo (entrevista), verde (contratar), vermelho (remover)
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

| Valor        | Exibição   | Cor      |
|--------------|------------|----------|
| `EXCELENTE`  | Excelente  | Verde    |
| `BOM`        | Bom        | Azul     |
| `MEDIANO`    | Mediano    | Amarelo  |
| `FRACO`      | Fraco      | Vermelho |

> O `getRanking` é **case-insensitive** — aceita `"bom"`, `"BOM"` ou `"Bom"` sem diferença.

---

## Filtro por vaga

O array `VAGAS` em `config.js` cobre 37 áreas do mercado com suas keywords. Para adicionar uma nova vaga:

```js
{ label: "Nome da Vaga", keywords: ["keyword1", "keyword2"] },
```

O filtro cruza as keywords com o campo `skills` e o `ai_summary` do candidato.

---

## Paginação

A listagem exibe **15 candidatos por página** (configurado em `state.js` via `PAGE_SIZE`). A navegação é reiniciada automaticamente sempre que a busca, ordenação ou filtro de vaga mudar.

---

## Estado local (localStorage)

| Chave             | Conteúdo                                         |
|-------------------|--------------------------------------------------|
| `candidateStatus` | Status de cada candidato (`entrevista` ou `contratado`) |

Persiste ao fechar o navegador mas **não sincroniza entre usuários ou dispositivos**. Quando o backend disponibilizar endpoints de status, substituir `setStatus` e `removeStatus` em `status.js` por chamadas à API.
