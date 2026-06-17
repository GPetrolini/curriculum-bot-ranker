// ── Filtro por Vaga ───────────────────────────────────────────────────────────

function toggleVagas() {
  const filters = document.getElementById("vagaFilters");
  const chevron = document.getElementById("vagaChevron");
  const isOpen  = !filters.classList.contains("vaga-filters--hidden");
  filters.classList.toggle("vaga-filters--hidden", isOpen);
  chevron.classList.toggle("vaga-chevron--open", !isOpen);
}

function renderVagaFilters() {
  const wrap = document.getElementById("vagaFilters");

  const allBtn  = `<button class="vaga-btn ${activeVaga === null ? 'vaga-btn--active' : ''}" onclick="setVaga(null)">Todos</button>`;
  const vagaBtns = VAGAS.map(v => `
    <button class="vaga-btn ${activeVaga === v.label ? 'vaga-btn--active' : ''}" onclick="setVaga('${v.label}')">
      ${v.label}
    </button>`).join("");

  wrap.innerHTML = allBtn + vagaBtns;

  const labelEl = document.getElementById("vagaActiveLabel");
  if (labelEl) {
    labelEl.textContent  = activeVaga ? activeVaga : "";
    labelEl.style.display = activeVaga ? "inline" : "none";
  }
}

function setVaga(label) {
  activeVaga = label;
  renderVagaFilters();
  go();
}

function matchesVaga(candidate, vaga) {
  if (!vaga) return true;
  const vagaObj = VAGAS.find(v => v.label === vaga);
  if (!vagaObj) return true;
  const skills   = candidate.skills || [];
  const haystack = [
    ...skills,
    candidate.ai_summary  || "",
    candidate.cleaned_text || "",
  ].join(" ").toLowerCase();

  // Usa \b (word boundary) em vez de includes() solto, pra evitar
  // falso positivo de keyword curta batendo dentro de outra palavra
  // (ex: keyword "r" casando com "trabalhar", "cs" casando com "fics").
  return vagaObj.keywords.some(kw => {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
  });
}

// ── Busca e Ordenação ─────────────────────────────────────────────────────────

function getFilteredAndSortedList() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const sort  = document.getElementById("sortSelect").value;

  let list = candidates.filter(c => {
    const skills = c.skills || [];
    return (
      (c.full_name || "").toLowerCase().includes(query) ||
      (c.email     || "").toLowerCase().includes(query) ||
      skills.some(s => s.toLowerCase().includes(query))
    ) && matchesVaga(c, activeVaga);
  });

  if (sort === "asc") {
    list = [...list].sort((a, b) => a.final_score - b.final_score);
  } else if (sort === "desc") {
    list = [...list].sort((a, b) => b.final_score - a.final_score);
  } else {
    list = [...list].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "pt"));
  }

  return list;
}

function go() {
  currentPage = 1;
  render(getFilteredAndSortedList());
}
