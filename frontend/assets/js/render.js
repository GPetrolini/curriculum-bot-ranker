// ── Stats ─────────────────────────────────────────────────────────────────────

function updateStats() {
  if (!candidates.length) return;

  const otimo = candidates.filter(c => c.ranking_level === "ÓTIMO").length;
  const pct   = Math.round((otimo / candidates.length) * 100);
  document.getElementById("pctOtimo").textContent = `${pct}%`;

  const top = candidates.reduce((a, b) => a.final_score > b.final_score ? a : b);
  document.getElementById("topScore").textContent = formatScore(top.final_score);
  document.getElementById("topName").textContent  = capitalizeName(top.full_name);
}

// ── Navegação entre páginas ───────────────────────────────────────────────────

function showPage(page) {
  document.getElementById("page-candidatos").classList.toggle("hidden", page !== "candidatos");
  document.getElementById("page-selecionados").classList.toggle("hidden", page !== "selecionados");
  document.getElementById("nav-candidatos").classList.toggle("active", page === "candidatos");
  document.getElementById("nav-selecionados").classList.toggle("active", page === "selecionados");
  if (page === "selecionados") renderSelected();
}

// ── Lista de Candidatos ───────────────────────────────────────────────────────

function renderRow(candidate) {
  const name    = capitalizeName(candidate.full_name);
  const av      = getAvatarColor(candidate.full_name);
  const ranking = getRanking(candidate.ranking_level);
  const status  = candidateStatus[candidate.candidate_id];
  const skills  = candidate.skills || [];

  const skillsHtml = renderSkillsRow(skills);

  const btnEntrevista = status === "entrevista"
    ? `<button class="action-btn action-btn--active action-btn--icon" title="Na entrevista — clique para remover" onclick="confirmRemover('${candidate.candidate_id}', '${name}', 'entrevista', event)">
         <i class="ti ti-calendar-check"></i>
       </button>`
    : status === "contratado"
    ? `<button class="action-btn action-btn--disabled action-btn--icon" disabled title="Já contratado">
         <i class="ti ti-calendar-event"></i>
       </button>`
    : `<button class="action-btn action-btn--icon" title="Marcar para entrevista" onclick="confirmEntrevista('${candidate.candidate_id}', '${name}', event)">
         <i class="ti ti-calendar-event"></i>
       </button>`;

  return `
    <div class="row" onclick="openModal('${candidate.candidate_id}')">
      <div class="av" style="background:${av.bg}; color:${av.color}">
        ${getInitials(candidate.full_name)}
      </div>
      <div class="info">
        <div class="cname">${name}</div>
        <div class="crole">${candidate.email || "—"}</div>
        <div class="row-skills">${skillsHtml}</div>
      </div>
      <div class="row-actions">
        ${btnEntrevista}
      </div>
      <div class="row-score">
        <div class="score-pill ${ranking.badgeClass}">
          <span class="score-number">${formatScore(candidate.final_score)}</span>
          <span class="score-sep">/100</span>
        </div>
        <div class="score-label ${ranking.badgeClass}-text">${ranking.label}</div>
      </div>
    </div>
  `;
}

function render(list) {
  const el = document.getElementById("list");
  if (list.length === 0) {
    el.innerHTML = '<div class="empty">Nenhum candidato encontrado.</div>';
    return;
  }
  el.innerHTML = list.map(c => renderRow(c)).join("");
}

// ── Página de Selecionados ────────────────────────────────────────────────────

function renderSelected() {
  const entrevista = candidates.filter(c => candidateStatus[c.candidate_id] === "entrevista");
  const contratado = candidates.filter(c => candidateStatus[c.candidate_id] === "contratado");

  document.getElementById("count-entrevista").textContent = entrevista.length;
  document.getElementById("count-contratado").textContent = contratado.length;

  renderSelectedList("list-entrevista", entrevista, "entrevista");
  renderSelectedList("list-contratado", contratado, "contratado");
}

function renderSelectedList(elId, list, type) {
  const el = document.getElementById(elId);

  if (list.length === 0) {
    el.innerHTML = type === "entrevista"
      ? '<div class="empty-col">Nenhum candidato na fila de entrevistas.</div>'
      : '<div class="empty-col">Nenhum candidato contratado ainda.</div>';
    return;
  }

  el.innerHTML = list.map(c => {
    const name    = capitalizeName(c.full_name);
    const av      = getAvatarColor(c.full_name);
    const ranking = getRanking(c.ranking_level);
    const skills  = c.skills || [];

    const actionBtn = type === "entrevista"
      ? `<button class="action-btn action-btn--green" onclick="confirmContratar('${c.candidate_id}', '${name}', event)">
           <i class="ti ti-user-check"></i> Contratar
         </button>
         <button class="action-btn action-btn--remove" onclick="confirmRemover('${c.candidate_id}', '${name}', 'entrevista', event)">
           <i class="ti ti-x"></i>
         </button>`
      : `<button class="action-btn action-btn--remove" onclick="confirmRemover('${c.candidate_id}', '${name}', 'contratado', event)">
           <i class="ti ti-x"></i> Remover
         </button>`;

    return `
      <div class="selected-card">
        <div class="av" style="background:${av.bg}; color:${av.color}">
          ${getInitials(c.full_name)}
        </div>
        <div class="info">
          <div class="cname">${name}</div>
          <div class="crole">${c.email || "—"}</div>
          <div class="row-skills">
            ${renderSkillsRow(skills)}
          </div>
        </div>
        <div class="selected-card-right">
          <div class="score-pill ${ranking.badgeClass}">
            <span class="score-number">${formatScore(c.final_score)}</span>
            <span class="score-sep">/100</span>
          </div>
          <div class="selected-card-actions">${actionBtn}</div>
        </div>
      </div>
    `;
  }).join("");
}
