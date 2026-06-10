// ── Helpers ───────────────────────────────────────────────────────────────────

function nameToColorIndex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % avatarColors.length;
}

function getAvatarColor(name) {
  return avatarColors[nameToColorIndex(name)];
}

function getRanking(level) {
  const key = (level || "").toUpperCase();
  return RANKING_MAP[key] ?? { badgeClass: "badge-low", label: level };
}

function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatScore(score) {
  return Number(score).toFixed(1);
}

/**
 * Converte "LUCAS SOUZA" → "Lucas Souza"
 */
function capitalizeName(name) {
  if (!name) return "—";
  return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Renderiza até MAX_SKILLS skills visíveis + badge "+N" para o restante.
 */
const MAX_SKILLS = 4;

function renderSkillsRow(skills) {
  if (!skills || skills.length === 0) return "";
  const visible = skills.slice(0, MAX_SKILLS);
  const hidden  = skills.length - MAX_SKILLS;
  const tags    = visible.map(s => `<span class="row-skill">${s}</span>`).join("");
  const more    = hidden > 0 ? `<span class="row-skill row-skill--more">+${hidden}</span>` : "";
  return tags + more;
}
