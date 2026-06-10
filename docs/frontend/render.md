# render.js

Responsável por toda a renderização de elementos no DOM.

---

## Funções

### `updateStats()`

```ts
updateStats(): void
```

Atualiza os três cards de estatísticas no topo da página:

| Elemento DOM | Dado exibido |
|---|---|
| `#pctOtimo` | Percentual de candidatos com `ranking_level === "ÓTIMO"` |
| `#topScore` | `final_score` do candidato com maior nota |
| `#topName` | Nome capitalizado desse candidato |

> `#totalCount` é atualizado diretamente por `fetchCandidates()`, não por esta função.

---

### `showPage(page)`

```ts
showPage(page: 'candidatos' | 'selecionados'): void
```

Alterna a visibilidade das páginas e o estado ativo dos itens de navegação. Chama `renderSelected()` ao navegar para `"selecionados"`.

---

### `renderRow(candidate)`

```ts
renderRow(candidate: Object): string
```

Gera o HTML de uma linha da listagem. Inclui avatar, nome, e-mail, skills, score e botão de ação contextual:

| Status do candidato | Botão exibido |
|---|---|
| `null` | Botão "Marcar para entrevista" |
| `"entrevista"` | Botão ativo "Na entrevista — clique para remover" |
| `"contratado"` | Botão desabilitado "Já contratado" |

---

### `render(list)`

```ts
render(list: Array): void
```

Renderiza a página atual da lista filtrada no `#list`. Calcula o slice da página corrente e chama `renderPagination()`.

---

### `renderPagination(total, totalPages)`

```ts
renderPagination(total: number, totalPages: number): void
```

Renderiza os controles de paginação. Omite o componente se `totalPages <= 1`. Exibe numeração com reticências para ranges longos (mantém sempre a primeira, a última e as adjacentes à página atual).

---

### `goToPage(page)`

```ts
goToPage(page: number): void
```

Navega para uma página específica re-aplicando os filtros e ordenação ativos. Faz scroll suave até `#list` após renderizar.

---

### `renderSelected()`

```ts
renderSelected(): void
```

Atualiza a aba Selecionados, separando `candidates[]` por status e chamando `renderSelectedList()` para cada fila. Atualiza os contadores `#count-entrevista` e `#count-contratado`.

---

### `renderSelectedList(elId, list, type)`

```ts
renderSelectedList(elId: string, list: Array, type: 'entrevista' | 'contratado'): void
```

Renderiza os cards de uma fila. Exibe mensagem de lista vazia quando `list` é vazio. Os botões de ação variam por `type`:

| `type` | Botões disponíveis |
|---|---|
| `"entrevista"` | Contratar + Remover |
| `"contratado"` | Remover |
