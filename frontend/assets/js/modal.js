// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(candidateId) {
  const c = candidates.find(c => c.candidate_id === candidateId);
  if (!c) return;

  const ranking  = getRanking(c.ranking_level);
  const skills   = c.skills || [];
  const expYears = c.ai_seniority != null ? `${c.ai_seniority} anos` : "—";

  document.getElementById("modal-name").textContent    = capitalizeName(c.full_name);
  document.getElementById("modal-email").textContent   = c.email       || "—";
  document.getElementById("modal-phone").textContent   = c.phone       || "—";
  document.getElementById("modal-summary").textContent = c.ai_summary  || "—";
  document.getElementById("modal-exp").textContent     = expYears;
  document.getElementById("modal-score").textContent   = `${formatScore(c.final_score)}%`;
  document.getElementById("modal-id").textContent      = c.candidate_id;

  const rankEl = document.getElementById("modal-ranking");
  rankEl.textContent = ranking.label;
  rankEl.className   = `modal-badge ${ranking.badgeClass}`;

  document.getElementById("modal-skills").innerHTML = skills
    .map(s => `<span class="skill-tag">${s}</span>`)
    .join("");

  document.getElementById("modal-overlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

function openConfirm({ icon, title, msg, okLabel, okClass, onConfirm }) {
  document.getElementById("confirm-icon").innerHTML    = icon;
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-msg").textContent   = msg;

  const okBtn      = document.getElementById("confirm-ok");
  okBtn.textContent = okLabel;
  okBtn.className   = `confirm-btn ${okClass}`;
  okBtn.onclick     = () => { onConfirm(); closeConfirm(); };

  document.getElementById("confirm-overlay").classList.add("open");
}

function closeConfirm() {
  document.getElementById("confirm-overlay").classList.remove("open");
}

// ── Confirmações de ação ──────────────────────────────────────────────────────

function confirmEntrevista(candidateId, name, event) {
  event.stopPropagation();
  openConfirm({
    icon:      '<i class="ti ti-calendar-event"></i>',
    title:     "Marcar para entrevista",
    msg:       `Tem certeza que deseja marcar entrevista com ${name}?`,
    okLabel:   "Marcar entrevista",
    okClass:   "confirm-btn--ok",
    onConfirm: () => setStatus(candidateId, "entrevista"),
  });
}

function confirmContratar(candidateId, name, event) {
  event.stopPropagation();
  openConfirm({
    icon:      '<i class="ti ti-user-check"></i>',
    title:     "Contratar candidato",
    msg:       `Tem certeza que deseja marcar ${name} como contratado?`,
    okLabel:   "Contratar",
    okClass:   "confirm-btn--ok confirm-btn--green",
    onConfirm: () => setStatus(candidateId, "contratado"),
  });
}

function confirmRemover(candidateId, name, type, event) {
  event.stopPropagation();
  const msg = type === "entrevista"
    ? `Tem certeza que deseja remover ${name} da fila de entrevistas?`
    : `Tem certeza que deseja remover ${name} dos contratados?`;

  openConfirm({
    icon:      '<i class="ti ti-trash"></i>',
    title:     "Remover candidato",
    msg,
    okLabel:   "Remover",
    okClass:   "confirm-btn--ok confirm-btn--red",
    onConfirm: () => removeStatus(candidateId),
  });
}

// ── Eventos globais ───────────────────────────────────────────────────────────

document.addEventListener("click", e => {
  if (e.target.id === "modal-overlay")   closeModal();
  if (e.target.id === "confirm-overlay") closeConfirm();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeConfirm(); }
});
