# recruta.ai — Frontend

Interface web do painel de candidatos. Exibe e filtra os currículos enviados ao bot.

---

## Estrutura

```
frontend/
├── index.html              # Entrada da aplicação
├── assets/
│   ├── css/
│   │   └── style.css       # Todos os estilos e design tokens
│   └── js/
│       └── app.js          # Lógica, fetch, render e filtros
└── README.md
```

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

## Stack

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Fontes: [Geist](https://fonts.google.com/specimen/Geist) via Google Fonts
- Ícones: [Tabler Icons](https://tabler.io/icons)
