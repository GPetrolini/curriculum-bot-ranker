// ── API ───────────────────────────────────────────────────────────────────────

function setLoading(state) {
  const el = document.getElementById("list");
  if (state) {
    el.innerHTML = `
      <div class="empty">
        <div class="spinner"></div>
        Carregando candidatos...
      </div>`;
  }
}

async function fetchCandidates() {
  setLoading(true);

  try {
    const res  = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    candidates = Array.isArray(data.candidates) ? data.candidates : [];

    document.getElementById("totalCount").textContent =
      candidates.length.toLocaleString("pt-BR");

    updateStats();
    renderVagaFilters();
    go();
  } catch (err) {
    console.error("Erro ao buscar candidatos:", err);
    document.getElementById("list").innerHTML =
      '<div class="empty">Erro ao carregar candidatos. Tente novamente.</div>';
  } finally {
    setLoading(false);
  }
}
