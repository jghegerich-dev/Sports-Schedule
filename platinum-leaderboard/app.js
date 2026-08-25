const SECTIONS = [
  { key: "leaderboard", label: "Leaderboard" },
  { key: "profile", label: "Player Profile" },
  { key: "games", label: "Game Difficulty Index" },
  { key: "about", label: "How Scoring Works" },
];

let activeSection = "leaderboard";
let activeUserId = null;

function initials(name) {
  return name.replace(/[^a-zA-Z0-9]/g, " ").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function rarityClass(pct) {
  return rarityLabel(pct).toLowerCase().replace(/\s+/g, "-");
}

function renderNav() {
  const nav = document.getElementById("main-nav");
  nav.innerHTML = "";
  SECTIONS.forEach(s => {
    const btn = document.createElement("button");
    btn.className = "nav-tab";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", s.key === activeSection ? "true" : "false");
    btn.textContent = s.label;
    btn.addEventListener("click", () => {
      activeSection = s.key;
      if (s.key === "profile" && !activeUserId) activeUserId = getLeaderboard()[0].user.id;
      renderNav();
      renderPanel();
    });
    nav.appendChild(btn);
  });
}

function goToProfile(userId) {
  activeUserId = userId;
  activeSection = "profile";
  renderNav();
  renderPanel();
}

function renderLeaderboard() {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const rows = getLeaderboard().map((stats, i) => {
    const rank = i + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
    return `
      <tr class="leaderboard-row" data-user="${stats.user.id}">
        <td class="rank">${medal}</td>
        <td>
          <div class="player-cell">
            <span class="player-avatar">${initials(stats.user.psnId)}</span>
            <span class="player-id">${stats.user.psnId}</span>
          </div>
        </td>
        <td class="score-cell">${stats.totalScore.toLocaleString()}</td>
        <td>${stats.count}</td>
        <td>${stats.avgDifficulty.toFixed(1)} / 10</td>
        <td>${stats.hardestPlat ? stats.hardestPlat.game.title : "—"}</td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <table>
      <thead>
        <tr><th>Rank</th><th>Player</th><th>Score</th><th>Plats</th><th>Avg Difficulty</th><th>Hardest Plat</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  wrap.querySelectorAll(".leaderboard-row").forEach(row => {
    row.addEventListener("click", () => goToProfile(row.dataset.user));
  });

  return wrap;
}

function renderProfile() {
  const container = document.createElement("div");
  const stats = computeUserStats(USERS.find(u => u.id === activeUserId) || USERS[0]);

  const picker = document.createElement("div");
  picker.className = "player-picker";
  getLeaderboard().forEach(s => {
    const btn = document.createElement("button");
    btn.className = "player-chip";
    btn.setAttribute("aria-selected", s.user.id === stats.user.id ? "true" : "false");
    btn.textContent = s.user.psnId;
    btn.addEventListener("click", () => goToProfile(s.user.id));
    picker.appendChild(btn);
  });
  container.appendChild(picker);

  const hero = document.createElement("div");
  hero.className = "profile-hero";
  hero.innerHTML = `
    <span class="player-avatar large">${initials(stats.user.psnId)}</span>
    <div>
      <h2>${stats.user.psnId}</h2>
      <p>Trophy hunter since ${stats.user.joined}</p>
      <div class="profile-stat-row">
        <div class="profile-stat"><span class="stat-value">${stats.totalScore.toLocaleString()}</span><span class="stat-label">Total Score</span></div>
        <div class="profile-stat"><span class="stat-value">${stats.count}</span><span class="stat-label">Platinums</span></div>
        <div class="profile-stat"><span class="stat-value">${stats.avgDifficulty.toFixed(1)}</span><span class="stat-label">Avg Difficulty</span></div>
      </div>
    </div>
  `;
  container.appendChild(hero);

  const grid = document.createElement("div");
  grid.className = "card-grid";
  stats.entries.forEach(e => {
    const card = document.createElement("div");
    card.className = "card plat-card";
    card.innerHTML = `
      <div class="card-row">
        <span class="plat-title">🏆 ${e.game.title}</span>
        <span class="score-badge">${e.score.toLocaleString()} pts</span>
      </div>
      <div class="meta">${e.game.platform} · Earned ${e.date}</div>
      <div class="tag-row">
        <span class="tag">Difficulty ${e.game.difficulty}/10</span>
        <span class="tag">${timeBucketLabel(e.game.avgHours)}</span>
        <span class="tag rarity-${rarityClass(e.game.rarityPct)}">${rarityLabel(e.game.rarityPct)} (${e.game.rarityPct}%)</span>
      </div>
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);

  return container;
}

function renderGames() {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const rows = GAMES
    .map(g => ({ g, ...computeGameScore(g) }))
    .sort((a, b) => b.score - a.score)
    .map(({ g, score }) => `
      <tr>
        <td>${g.title}</td>
        <td>${g.platform}</td>
        <td>${g.difficulty} / 10</td>
        <td>${g.avgHours}h <span class="meta">(${timeBucketLabel(g.avgHours)})</span></td>
        <td><span class="tag rarity-${rarityClass(g.rarityPct)}">${rarityLabel(g.rarityPct)}</span> ${g.rarityPct}%</td>
        <td class="score-cell">${score.toLocaleString()}</td>
      </tr>
    `).join("");

  wrap.innerHTML = `
    <table>
      <thead>
        <tr><th>Game</th><th>Platform</th><th>Difficulty</th><th>Avg Time to Plat</th><th>Rarity</th><th>Base Score</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="standings-note">Ranked hardest-to-earn first. Base score is what any player earns for platinuming that title.</div>
  `;

  return wrap;
}

function renderAbout() {
  const wrap = document.createElement("div");
  wrap.className = "about-content";
  wrap.innerHTML = `
    <div class="card">
      <h2>How the score is calculated</h2>
      <p>Every platinum trophy earns points based on how hard it actually was to get — not just that you got it. The formula:</p>
      <p class="formula">Score = 100 &times; Difficulty &times; Time &times; Rarity</p>
      <ul>
        <li><strong>Difficulty (1–10):</strong> community-rated challenge of the platinum, from 0.7&times; up to 2.5&times;.</li>
        <li><strong>Time:</strong> average hours to platinum, bucketed from 1.0&times; (under 5 hrs) up to 2.75&times; (100+ hrs).</li>
        <li><strong>Rarity:</strong> the share of trophy hunters who've actually earned the platinum, using the same Common / Uncommon / Rare / Very Rare / Ultra Rare tiers PSNProfiles uses — from 1.0&times; down to 2.0&times; for Ultra Rare (under 5%).</li>
      </ul>
      <p>A quick, common platinum like <em>Astro's Playroom</em> nets around 100 points. A brutal, rare grind like <em>Nioh 2</em> or <em>Rocket League</em> can be worth 1,000+ points — over ten times as much for one trophy.</p>
      <p>Your leaderboard total is simply the sum of every platinum's score. This rewards depth (more platinums) and challenge (harder platinums) together, rather than just trophy count.</p>
    </div>
    <div class="card">
      <h2>What's next</h2>
      <ul>
        <li>Weight in gold/silver/bronze trophy completion per game, not just the platinum.</li>
        <li>Pull live difficulty/rarity data from a real trophy tracking source.</li>
        <li>Seasonal leaderboards and head-to-head comparisons between friends.</li>
      </ul>
    </div>
  `;
  return wrap;
}

const RENDERERS = {
  leaderboard: renderLeaderboard,
  profile: renderProfile,
  games: renderGames,
  about: renderAbout,
};

function renderPanel() {
  const panel = document.getElementById("panel");
  panel.innerHTML = "";
  panel.appendChild(RENDERERS[activeSection]());
}

function initTheme() {
  const saved = localStorage.getItem("platinum-leaderboard-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("platinum-leaderboard-theme", theme);
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

initTheme();
renderNav();
renderPanel();
