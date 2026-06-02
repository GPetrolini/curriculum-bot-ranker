# recruta.ai — Frontend

Interface web do painel de candidatos. Exibe, filtra e gerencia os currículos enviados ao bot.

---

## Estrutura

```
frontend/
├── index.html              # Entrada da aplicação
├── assets/
│   ├── css/
│   │   └── style.css       # Todos os estilos e design tokens
│   └── js/
│       └── app.js          # Lógica, fetch, render, filtros e estado
└── README.md
```

---

## Funcionalidades

### Painel de Candidatos
- Cards de estatísticas: total de candidatos, % classificados como Ótimo e candidato com maior nota
- Listagem com nome, e-mail, skills, score e ranking de cada candidato
- Busca em tempo real por nome, e-mail ou skill
- Ordenação por score (crescente ou decrescente) ou por nome
- Filtro por vaga com 37 áreas do mercado — colapsável para não poluir a tela
- Modal de detalhes com todas as informações do candidato ao clicar na linha

### Aba Selecionados
- Lista de candidatos chamados para entrevista
- Lista de candidatos contratados
- Botão "Entrevista" em cada linha da listagem principal
- Ação de contratar move o candidato da fila de entrevistas para contratados
- Botão de remover em ambas as listas
- Status persistido no `localStorage` — mantém os dados mesmo ao fechar o navegador

### Confirmações
- Dialog de confirmação ao marcar entrevista, contratar ou remover candidato
- Cores diferentes por tipo de ação: roxo (entrevista), verde (contratar), vermelho (remover)
- Fecha com ESC ou clicando fora

---

## Como rodar localmente

Basta abrir o `index.html` no navegador — não precisa de servidor ou build.

Para simular a API com live reload, recomendamos a extensão **Live Server** no VS Code:

1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Clique com o botão direito em `index.html` → **Open with Live Server**

---

## Conectar ao backend

No arquivo `assets/js/app.js`, localize a seção `Config` no topo:

```js
const API_URL = "https://sua-api.com/candidates"; // 🔧 Troque pela URL real
```

Em seguida, localize o bloco de fetch dentro de `fetchCandidates()` e substitua o mock pelo fetch real:

```js
// Descomente as linhas abaixo e remova o bloco de mock:
const res  = await fetch(API_URL);
const data = await res.json();
candidates = Array.isArray(data) ? data : [data];
```

### Formato esperado da resposta

```json
[
  {
    "status": "success",
    "candidate_id": "uuid-aqui",
    "name": "Nome Completo",
    "email": "email@dominio.com",
    "phone": "+5511999999999",
    "summary": "Resumo profissional do candidato.",
    "skills": ["python", "sql", "airflow"],
    "experience_years": 5,
    "final_score": 78.5,
    "ranking_level": "BOM"
  }
]
```

### Valores válidos para `ranking_level`

| Valor     | Exibição | Cor      |
|-----------|----------|----------|
| `ÓTIMO`   | Ótimo    | Verde    |
| `BOM`     | Bom      | Âmbar    |
| `REGULAR` | Regular  | Lilás    |
| `FRACO`   | Fraco    | Vermelho |

---

## Filtro por vaga

O array `VAGAS` no topo do `app.js` contém 37 áreas do mercado com suas keywords. Para adicionar uma vaga nova, basta inserir uma linha:

```js
{ label: "Nome da Vaga", keywords: ["keyword1", "keyword2", "keyword3"] },
```

O filtro cruza as keywords com o campo `skills` e o `summary` do candidato. Quanto mais padronizadas forem as skills extraídas pelo bot, mais preciso será o filtro.

---

## Estado local (localStorage)

O status de cada candidato (entrevista ou contratado) é salvo no `localStorage` do navegador sob a chave `candidateStatus`. Isso significa:

- ✅ Persiste ao fechar e reabrir o navegador
- ❌ Não sincroniza entre usuários diferentes ou dispositivos diferentes

Quando o backend disponibilizar endpoints de status, basta substituir as funções `setStatus` e `removeStatus` no `app.js` por chamadas à API.

---

## Stack

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Fontes: [Geist](https://fonts.google.com/specimen/Geist) via Google Fonts
- Ícones: [Tabler Icons](https://tabler.io/icons)
