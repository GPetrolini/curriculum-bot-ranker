// ── Status dos Candidatos ─────────────────────────────────────────────────────

async function setStatus(candidateId, status) {
  if (status === "entrevista") {
    try {
      await fetch(`${API_BASE}/candidates/interview-selection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId }),
      });
    } catch (err) {
      console.error("Erro ao registrar seleção no servidor:", err);
    }
  }

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
