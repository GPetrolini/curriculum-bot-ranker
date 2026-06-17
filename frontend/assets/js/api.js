// ── API ───────────────────────────────────────────────────────────────────────

function setLoading(state) {
  const el  = document.getElementById("list");
  const btn = document.getElementById("refreshBtn");

  if (state) {
    el.innerHTML = `
      <div class="empty">
        <div class="spinner"></div>
        Carregando candidatos...
      </div>`;

    if (btn) {
      btn.disabled = true;
      btn.classList.add("refresh-btn--loading");
      btn.querySelector(".refresh-label").textContent = "Atualizando...";
    }
  } else {
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("refresh-btn--loading");
      btn.querySelector(".refresh-label").textContent = "Atualizar";
    }
    updateLastRefreshLabel();
  }
}

function updateLastRefreshLabel() {
  const el = document.getElementById("lastRefreshLabel");
  if (!el) return;
  if (!lastRefresh) { el.textContent = ""; return; }

  const diff = Math.floor((Date.now() - lastRefresh) / 1000);
  if (diff < 60)  el.textContent = `Atualizado há ${diff}s`;
  else            el.textContent = `Atualizado há ${Math.floor(diff / 60)}min`;
}

async function fetchCandidates(silent = false) {
  if (!silent) setLoading(true);

  try {
    const res  = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    candidates = Array.isArray(data.candidates) ? data.candidates : [];

    document.getElementById("totalCount").textContent =
      candidates.length.toLocaleString("pt-BR");

    dataLoaded = true;
    lastRefresh = Date.now();
    updateStats();
    renderVagaFilters();

    // Force update da aba que está ativa no momento, sem importar quando foi clicada
    updateCurrentView();
  } catch (err) {
    console.error("Erro ao buscar candidatos:", err);
    if (!silent) {
      document.getElementById("list").innerHTML =
        '<div class="empty">Erro ao carregar candidatos. Tente novamente.</div>';
    }
  } finally {
    if (!silent) setLoading(false); // <-- essa linha precisa estar aqui
  }
}
