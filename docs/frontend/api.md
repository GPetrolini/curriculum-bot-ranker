# api.js

Responsável pela comunicação com o backend e pelo controle visual de loading.

---

## Funções

### `fetchCandidates(silent?)`

```ts
fetchCandidates(silent?: boolean): Promise<void>
```

Busca os candidatos na API e atualiza o estado global.

| Parâmetro | Padrão | Descrição |
|---|---|---|
| `silent` | `false` | Se `true`, busca em background sem feedback visual |

**Fluxo:**

1. Chama `setLoading(true)` se `silent = false`.
2. Faz `fetch(API_URL)`.
3. Popula `candidates[]` e atualiza `#totalCount`.
4. Chama `updateStats()`, `renderVagaFilters()` e `go()`.
5. Em erro: exibe mensagem no `#list` (somente se `silent = false`).
6. Chama `setLoading(false)` no `finally`.

---

### `setLoading(state)`

```ts
setLoading(state: boolean): void
```

Alterna o estado visual de carregamento.

- `true` → exibe spinner no `#list`, desabilita `#refreshBtn` com label "Atualizando...".
- `false` → restaura o botão e chama `updateLastRefreshLabel()`.

---

### `updateLastRefreshLabel()`

```ts
updateLastRefreshLabel(): void
```

Atualiza `#lastRefreshLabel` com o tempo relativo desde a última atualização.

| Tempo decorrido | Texto exibido |
|---|---|
| < 60 segundos | `Atualizado há Xs` |
| ≥ 60 segundos | `Atualizado há Xmin` |
