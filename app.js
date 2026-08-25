const TEAM_KEYS = ["patriots", "redsox", "celtics"];
const SECTIONS = [
  { key: "scores", label: "Scores" },
  { key: "players", label: "Player Stats" },
  { key: "schedule", label: "Schedule" },
  { key: "standings", label: "Standings" },
];

let activeTeam = TEAM_KEYS[0];
let activeSection = "scores";

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function renderNav() {
  const nav = document.getElementById("team-nav");
  nav.innerHTML = "";
  TEAM_KEYS.forEach(key => {
    const team = TEAMS[key];
    const btn = document.createElement("button");
    btn.className = "team-btn";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", key === activeTeam ? "true" : "false");
    btn.innerHTML = `<span class="dot" style="background:${team.accent}"></span>${team.name} <span style="opacity:.6;font-weight:500">(${team.league})</span>`;
    btn.addEventListener("click", () => {
      activeTeam = key;
      renderNav();
      renderPanel();
    });
    nav.appendChild(btn);
  });
}

function renderScores(team) {
  const grid = document.createElement("div");
  grid.className = "card-grid";
  team.scores.slice().reverse().forEach(g => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-row">
        <span class="date">${formatDate(g.date)}</span>
        <span class="result-badge ${g.result}">${g.result === "W" ? "WIN" : "LOSS"}</span>
      </div>
      <div class="opponent">${g.home ? "vs" : "@"} ${g.opponent}</div>
      <div class="score-line">${g.teamScore} <span class="opp-score">– ${g.oppScore}</span></div>
      ${g.note ? `<div class="meta">${g.note}</div>` : ""}
    `;
    grid.appendChild(card);
  });
  return grid;
}

function renderPlayers(team) {
  const grid = document.createElement("div");
  grid.className = "card-grid";
  team.players.forEach(p => {
    const card = document.createElement("div");
    card.className = "card player-card";
    card.innerHTML = `
      <div class="player-avatar" style="background:${team.color}">${initials(p.name)}</div>
      <div>
        <div class="player-name">${p.name}</div>
        <div class="player-pos">${p.pos}</div>
        <div class="player-stats">${p.statLine}</div>
      </div>
    `;
    grid.appendChild(card);
  });
  return grid;
}

function renderSchedule(team) {
  const grid = document.createElement("div");
  grid.className = "card-grid";
  team.schedule.forEach(g => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-row">
        <span class="date">${formatDate(g.date)}</span>
        <span class="meta">${g.time}</span>
      </div>
      <div class="opponent">${g.home ? "vs" : "@"} ${g.opponent}</div>
      ${g.note ? `<div class="meta">${g.note}</div>` : `<div class="meta">${g.home ? "Home" : "Away"}</div>`}
    `;
    grid.appendChild(card);
  });
  return grid;
}

function renderStandings(team) {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const rows = team.standings.rows.map(r => `
    <tr class="${r.team === team.name ? "highlight" : ""}">
      <td>${r.team}</td>
      <td>${r.w}</td>
      <td>${r.l}</td>
      <td>${r.pct}</td>
      <td>${r.gb}</td>
    </tr>
  `).join("");
  wrap.innerHTML = `
    <table>
      <thead>
        <tr><th>${team.standings.group}</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="standings-note">${team.standings.note}</div>
  `;
  return wrap;
}

const RENDERERS = {
  scores: renderScores,
  players: renderPlayers,
  schedule: renderSchedule,
  standings: renderStandings,
};

function renderPanel() {
  const team = TEAMS[activeTeam];
  const panel = document.getElementById("team-panel");
  panel.innerHTML = "";
  panel.style.setProperty("--team-color", team.color);
  panel.style.setProperty("--team-accent", team.accent);

  const hero = document.createElement("div");
  hero.className = "team-hero";
  hero.style.setProperty("--team-color", team.color);
  hero.style.setProperty("--team-accent", team.accent);
  hero.innerHTML = `
    <div class="logo">${team.logoText}</div>
    <div>
      <h2>${team.name}</h2>
      <p>${team.blurb}</p>
    </div>
  `;
  panel.appendChild(hero);

  const tabs = document.createElement("div");
  tabs.className = "section-tabs";
  tabs.setAttribute("role", "tablist");
  SECTIONS.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "section-tab";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", s.key === activeSection ? "true" : "false");
    btn.textContent = s.label;
    btn.addEventListener("click", () => {
      activeSection = s.key;
      renderPanel();
    });
    tabs.appendChild(btn);
  });
  panel.appendChild(tabs);

  const content = document.createElement("div");
  content.style.setProperty("--team-color", team.color);
  content.style.setProperty("--team-accent", team.accent);
  content.appendChild(RENDERERS[activeSection](team));
  panel.appendChild(content);
}

function initTheme() {
  const saved = localStorage.getItem("sports-tracker-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("sports-tracker-theme", theme);
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

initTheme();
renderNav();
renderPanel();
