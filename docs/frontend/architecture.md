# Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Markup | HTML5 |
| Estilos | CSS3 (vanilla, sem pré-processador) |
| Scripts | JavaScript ES6+ (vanilla, sem framework) |
| Tipografia | [Geist](https://vercel.com/font) via Google Fonts |
| Ícones | [Tabler Icons](https://tabler.io/icons) via CDN |

Não há processo de build, bundler ou gerenciador de pacotes. Todos os módulos são carregados diretamente via `<script>` no `index.html`.

---

## Padrão arquitetural

O frontend usa **estado global mutável com re-renderização imperativa**. Não há reatividade automática — cada ação chama explicitamente as funções de render necessárias.

```
fetchCandidates()
    └─▶ candidates[]          (state.js)
            └─▶ go()          (filters.js)
                    └─▶ render(filteredList)   (render.js)

setStatus() / removeStatus()  (status.js)
    └─▶ candidateStatus{}     (state.js / localStorage)
            └─▶ go() + renderSelected()
```

---

## Módulos e responsabilidades

| Módulo | Responsabilidade |
|---|---|
| `config.js` | Constantes globais: URL da API, cores, rankings e vagas |
| `state.js` | Estado global da aplicação |
| `helpers.js` | Funções utilitárias puras (sem efeitos colaterais) |
| `api.js` | Comunicação com o backend e controle de loading |
| `render.js` | Renderização de listas, stats, paginação e aba Selecionados |
| `filters.js` | Busca, ordenação e filtro por vaga |
| `status.js` | Ciclo de vida dos status dos candidatos |
| `modal.js` | Modal de detalhes e dialogs de confirmação |

### Ordem de carregamento

Os módulos são carregados nessa ordem no `index.html`, pois os posteriores dependem das variáveis declaradas nos anteriores:

```
config.js → state.js → helpers.js → api.js → render.js → filters.js → status.js → modal.js
```

---

## Persistência de estado

O único estado persistido entre sessões é o status dos candidatos (entrevista/contratado), salvo no `localStorage` pela chave `candidateStatus`.

Ver [api-integration.md](./api-integration.md#estado-local) para detalhes.
