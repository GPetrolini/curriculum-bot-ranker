# config.js

Centraliza todas as constantes globais da aplicação. É o único arquivo que deve ser alterado para ajustes de configuração.

---

## Variáveis exportadas

| Variável | Tipo | Descrição |
|---|---|---|
| `API_BASE` | `string` | URL base do backend |
| `API_URL` | `string` | Endpoint completo: `API_BASE + "/candidates/"` |
| `avatarColors` | `Array<{bg, color}>` | Paleta de 8 pares de cores para avatares |
| `RANKING_MAP` | `Object` | Mapeamento de `ranking_level` → `{ badgeClass, label }` |
| `VAGAS` | `Array<{label, keywords[]}>` | 37 áreas de mercado para o filtro por vaga |

---

## RANKING_MAP

```js
const RANKING_MAP = {
  "ÓTIMO":   { badgeClass: "badge-high", label: "Ótimo"   },
  "BOM":     { badgeClass: "badge-mid",  label: "Bom"     },
  "REGULAR": { badgeClass: "badge-low",  label: "Regular" },
  "FRACO":   { badgeClass: "badge-weak", label: "Fraco"   },
};
```

---

## VAGAS

Array com 37 entradas cobrindo Tecnologia, Negócios, Engenharia, Saúde e Educação. Cada entrada tem um `label` (exibido no botão de filtro) e `keywords` (cruzadas com `skills` e `ai_summary` do candidato).

Para adicionar uma nova área:

```js
{ label: "Nome da Vaga", keywords: ["keyword1", "keyword2"] },
```
