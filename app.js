// ── Data ──────────────────────────────────────────────────────────────────────

const candidates = [
  { name: "Ana Luiza Ferreira", role: "Desenvolvedora front-end",  score: 94, time: "2h"  },
  { name: "Bruno Martins",      role: "Analista de dados",          score: 87, time: "3h"  },
  { name: "Carla Souza",        role: "UX designer",                score: 76, time: "5h"  },
  { name: "Diego Alves",        role: "Engenheiro back-end",        score: 91, time: "6h"  },
  { name: "Elisa Cunha",        role: "Product manager",            score: 65, time: "8h"  },
  { name: "Fábio Ramos",        role: "DevOps engineer",            score: 82, time: "10h" },
  { name: "Gabriela Nunes",     role: "QA engineer",                score: 58, time: "12h" },
  { name: "Henrique Lima",      role: "Cientista de dados",         score: 78, time: "1d"  },
  { name: "Isabela Torres",     role: "Desenvolvedora mobile",      score: 89, time: "1d"  },
  { name: "João Pedro Costa",   role: "Arquiteto de software",      score: 96, time: "2d"  },
];

// ── Avatar Colors ─────────────────────────────────────────────────────────────

const avatarColors = [
  { bg: "#1e1d3a", color: "#a89ff8" },
  { bg: "#0d2a2a", color: "#5dcaa5" },
  { bg: "#2a1a1a", color: "#f0997b" },
  { bg: "#1a2014", color: "#97c459" },
  { bg: "#2a1a28", color: "#ed93b1" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function getBadgeClass(score) {
  if (score >= 85) return "badge-high";
  if (score >= 70) return "badge-mid";
  return "badge-low";
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderRow(candidate, index) {
  const av    = avatarColors[index % avatarColors.length];
  const badge = getBadgeClass(candidate.score);

  return `
    <div class="row">
      <div class="av" style="background:${av.bg}; color:${av.color}">
        ${getInitials(candidate.name)}
      </div>
      <div class="info">
        <div class="cname">${candidate.name}</div>
        <div class="crole">${candidate.role}</div>
      </div>
      <span class="badge ${badge}">${candidate.score}%</span>
      <span class="tm">${candidate.time} atrás</span>
    </div>
  `;
}

function render(list) {
  const el = document.getElementById("list");

  if (list.length === 0) {
    el.innerHTML = '<div class="empty">Nenhum candidato encontrado.</div>';
    return;
  }

  el.innerHTML = list.map((c, i) => renderRow(c, i)).join("");
}

// ── Filter & Sort ─────────────────────────────────────────────────────────────

function go() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const sort  = document.getElementById("sortSelect").value;

  let list = candidates.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.role.toLowerCase().includes(query)
  );

  if (sort === "asc") {
    list = [...list].sort((a, b) => b.score - a.score);
  } else if (sort === "desc") {
    list = [...list].sort((a, b) => a.score - b.score);
  } else {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  render(list);
}

// ── Init ──────────────────────────────────────────────────────────────────────

go();
