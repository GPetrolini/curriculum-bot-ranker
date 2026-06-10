# filters.js

Gerencia busca, ordenação e filtro por vaga.

---

## Funções

### `go()`

```ts
go(): void
```

Função principal de filtragem. Lê os valores atuais de `#searchInput` e `#sortSelect`, aplica filtros sobre `candidates[]`, reseta `currentPage` para `1` e chama `render()`.

**Lógica de busca:** o query é cruzado contra `full_name`, `email` e cada item de `skills[]` do candidato (case-insensitive).

**Opções de ordenação:**

| Valor de `#sortSelect` | Comportamento |
|---|---|
| `"asc"` | Score decrescente (maior → menor) |
| `"desc"` | Score crescente (menor → maior) |
| `"name"` | Alfabético por nome (`localeCompare` com locale `pt`) |

---

### `toggleVagas()`

```ts
toggleVagas(): void
```

Abre/fecha o painel colapsável de filtro por vaga, alternando `vaga-filters--hidden` no container e `vaga-chevron--open` no ícone.

---

### `renderVagaFilters()`

```ts
renderVagaFilters(): void
```

Renderiza os botões de vaga no `#vagaFilters` a partir do array `VAGAS` em `config.js`. Marca o botão ativo com `vaga-btn--active` e atualiza o label `#vagaActiveLabel`.

---

### `setVaga(label)`

```ts
setVaga(label: string | null): void
```

Define `activeVaga`, re-renderiza os filtros e chama `go()`. Passar `null` limpa o filtro (exibe todos os candidatos).

---

### `matchesVaga(candidate, vaga)`

```ts
matchesVaga(candidate: Object, vaga: string | null): boolean
```

Verifica se um candidato corresponde à vaga selecionada. Retorna `true` se `vaga` for `null`. Concatena `skills[]`, `ai_summary` e `cleaned_text` do candidato e verifica se alguma keyword da vaga está contida no texto resultante.
