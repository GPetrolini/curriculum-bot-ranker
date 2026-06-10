// ── Status dos Candidatos ─────────────────────────────────────────────────────

function setStatus(candidateId, status) {
  candidateStatus[candidateId] = status;
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus));
  go();
  renderSelected();
}

function removeStatus(candidateId) {
  delete candidateStatus[candidateId];
  localStorage.setItem("candidateStatus", JSON.stringify(candidateStatus));
  go();
  renderSelected();
}
