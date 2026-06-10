# helpers.js

Funções utilitárias puras — não produzem efeitos colaterais e não acessam o DOM.

---

## Funções

### `nameToColorIndex(name)`

```ts
nameToColorIndex(name: string): number
```

Gera um índice de cor determinístico via hash polynomial. O mesmo nome sempre retorna o mesmo índice, independente da posição na lista.

---

### `getAvatarColor(name)`

```ts
getAvatarColor(name: string): { bg: string, color: string }
```

Retorna o par de cores (fundo e texto) para o avatar de um candidato, derivado do nome.

---

### `getRanking(level)`

```ts
getRanking(level: string): { badgeClass: string, label: string }
```

Busca o mapeamento visual para um `ranking_level` no `RANKING_MAP`. Retorna `badge-low` como fallback para valores não reconhecidos.

---

### `getInitials(name)`

```ts
getInitials(name: string): string
```

Extrai as iniciais das duas primeiras palavras do nome em maiúsculas.

```js
getInitials("Lucas Souza Silva") // → "LS"
getInitials("Ana")               // → "A"
```

---

### `formatScore(score)`

```ts
formatScore(score: number): string
```

Formata um score numérico com uma casa decimal.

```js
formatScore(78.555) // → "78.6"
formatScore(100)    // → "100.0"
```

---

### `capitalizeName(name)`

```ts
capitalizeName(name: string): string
```

Converte nomes em caixa alta (vindos do backend) para formato capitalizado. Retorna `"—"` para valores falsy.

```js
capitalizeName("LUCAS SOUZA") // → "Lucas Souza"
capitalizeName("")            // → "—"
```

---

### `renderSkillsRow(skills)`

```ts
renderSkillsRow(skills: string[]): string
```

Gera HTML com até 4 skills visíveis e badge `+N` para o restante. Retorna string vazia se `skills` for vazio ou nulo.

```js
renderSkillsRow(["python", "sql", "airflow", "docker", "kubernetes"])
// → '<span class="row-skill">python</span>...<span class="row-skill row-skill--more">+1</span>'
```

**Constante relacionada:** `MAX_SKILLS = 4` (definida no mesmo arquivo).
