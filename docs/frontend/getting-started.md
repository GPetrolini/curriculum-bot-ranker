# Getting Started

## Pré-requisitos

Nenhuma instalação necessária. O frontend não possui processo de build nem dependências de Node.

---

## Rodando localmente

### Opção 1 — Live Server (recomendado)

1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code.
2. Clique com o botão direito em `index.html` → **Open with Live Server**.

### Opção 2 — Terminal

```bash
# Python 3
python -m http.server 5500

# Node.js
npx serve frontend/
```

Acesse `http://localhost:5500` no navegador.

---

## Conectando ao backend

A URL da API está centralizada em `assets/js/config.js`:

```js
const API_BASE = "https://curriculum-bot-ranker.onrender.com";
const API_URL  = `${API_BASE}/candidates/`;
```

Para apontar para um backend local durante o desenvolvimento, basta alterar `API_BASE`:

```js
const API_BASE = "http://localhost:8000";
```

> O backend em produção está hospedado no Render e pode ter **cold start de alguns segundos** na primeira requisição após inatividade.

---

## Variáveis de configuração

Todas as configurações estão em `config.js`. Não há arquivo `.env`.

| Variável | Descrição |
|---|---|
| `API_BASE` | URL base do backend |
| `API_URL` | Endpoint completo de candidatos |
| `avatarColors` | Paleta de cores para avatares gerados por nome |
| `RANKING_MAP` | Mapeamento de `ranking_level` para classes CSS e labels |
| `VAGAS` | Array de 37 áreas de mercado com keywords para o filtro |

Para adicionar uma nova vaga ao filtro:

```js
// assets/js/config.js — array VAGAS
{ label: "Nome da Vaga", keywords: ["keyword1", "keyword2"] },
```
