# state.js

Declara as variáveis de estado global da aplicação. Todos os módulos lêem e escrevem diretamente nessas variáveis.

---

## Variáveis de estado

| Variável | Tipo | Valor inicial | Descrição |
|---|---|---|---|
| `candidates` | `Array` | `[]` | Lista completa de candidatos retornada pela API |
| `candidateStatus` | `Object` | lido do `localStorage` | Status de cada candidato por `candidate_id` |
| `activeVaga` | `string \| null` | `null` | Vaga selecionada no filtro (`null` = Todos) |
| `currentPage` | `number` | `1` | Página atual da listagem paginada |
| `PAGE_SIZE` | `number` | `15` | Itens por página (constante) |

---

## Notas

- `candidateStatus` é hidratado do `localStorage` na inicialização, garantindo que os status sobrevivam ao fechar o navegador.
- `candidates` é substituído inteiro a cada `fetchCandidates()` — não é acumulado.
- `currentPage` é resetado para `1` sempre que `go()` é chamado diretamente (busca ou troca de filtro). É preservado apenas em `goToPage()`.
