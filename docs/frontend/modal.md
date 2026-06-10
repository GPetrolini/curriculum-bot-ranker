# modal.js

Gerencia o modal de detalhes do candidato e os dialogs de confirmação de ações destrutivas.

---

## Modal de detalhes

### `openModal(candidateId)`

```ts
openModal(candidateId: string): void
```

Abre o modal preenchendo todos os campos com os dados do candidato.

| Elemento DOM | Dado exibido |
|---|---|
| `#modal-name` | Nome capitalizado |
| `#modal-email` | E-mail |
| `#modal-phone` | Telefone |
| `#modal-summary` | Resumo gerado pela IA |
| `#modal-exp` | Anos de experiência (`ai_seniority`) |
| `#modal-score` | Score formatado com `%` |
| `#modal-ranking` | Badge de ranking com classe CSS dinâmica |
| `#modal-id` | UUID do candidato |
| `#modal-skills` | Lista completa de skills como `skill-tag` |

---

### `closeModal()`

```ts
closeModal(): void
```

Remove a classe `open` do `#modal-overlay`, fechando o modal.

---

## Dialog de confirmação

### `openConfirm(options)`

```ts
openConfirm(options: ConfirmOptions): void
```

Abre o dialog de confirmação genérico, configurável por opções.

```ts
interface ConfirmOptions {
  icon:      string;      // HTML do ícone
  title:     string;      // Título do dialog
  msg:       string;      // Mensagem de confirmação
  okLabel:   string;      // Texto do botão de confirmar
  okClass:   string;      // Classes CSS do botão (define a cor)
  onConfirm: () => void;  // Callback executado ao confirmar
}
```

---

### `closeConfirm()`

```ts
closeConfirm(): void
```

Remove a classe `open` do `#confirm-overlay`, fechando o dialog.

---

## Ações de confirmação pré-configuradas

| Função | Cor | Ação executada |
|---|---|---|
| `confirmEntrevista(candidateId, name, event)` | Roxo | `setStatus(id, "entrevista")` |
| `confirmContratar(candidateId, name, event)` | Verde | `setStatus(id, "contratado")` |
| `confirmRemover(candidateId, name, type, event)` | Vermelho | `removeStatus(id)` |

Todas chamam `event.stopPropagation()` para evitar que o clique propague e abra o modal do candidato.

---

## Eventos globais

| Evento | Condição | Ação |
|---|---|---|
| `click` | target é `#modal-overlay` | Fecha o modal |
| `click` | target é `#confirm-overlay` | Fecha o dialog |
| `keydown` | tecla `Escape` | Fecha modal e dialog simultaneamente |
