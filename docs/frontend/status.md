# status.js

Gerencia o ciclo de vida dos status dos candidatos.

---

## Fluxo de status

```
null  ──▶  "entrevista"  ──▶  "contratado"
 ▲               │                  │
 └───────────────┴──────────────────┘
              removeStatus()
```

---

## Funções

### `setStatus(candidateId, status)`

```ts
setStatus(candidateId: string, status: 'entrevista' | 'contratado'): void
```

Atribui um status ao candidato, persiste no `localStorage` e re-renderiza a lista e a aba Selecionados.

---

### `removeStatus(candidateId)`

```ts
removeStatus(candidateId: string): void
```

Remove o status do candidato, persiste no `localStorage` e re-renderiza.

---

## Migração futura

Quando o backend implementar endpoints de status, substituir o corpo destas funções por chamadas à API — as assinaturas podem ser mantidas:

```js
// Exemplo de migração de setStatus()
async function setStatus(candidateId, status) {
  await fetch(`${API_BASE}/candidates/${candidateId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: { "Content-Type": "application/json" },
  });
  candidateStatus[candidateId] = status;
  go();
  renderSelected();
}
```
