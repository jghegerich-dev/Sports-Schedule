const TEAM_KEYS = ["patriots", "redsox", "celtics"];
const BASE_SECTIONS = [
  { key: "scores", label: "Scores" },
  { key: "players", label: "Player Stats" },
  { key: "schedule", label: "Schedule" },
  { key: "standings", label: "Standings" },
];

let activeTeam = TEAM_KEYS[0];
let activeSection = "scores";
let liveInterval = null;

function stopLivePolling() {
  if (liveInterval) {
    clearInterval(liveInterval);
    liveInterval = null;
  }
}

async function fetchLiveGame(mlbTeamId) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${mlbTeamId}&date=${dateStr}&hydrate=linescore`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const games = (data.dates && data.dates[0] && data.dates[0].games) || [];
  if (games.length === 0) return null;

  const g = games[0];
  const isHome = g.teams.home.team.id === mlbTeamId;
  const us = isHome ? g.teams.home : g.teams.away;
  const them = isHome ? g.teams.away : g.teams.home;
  const state = g.status.abstractGameState; // "Preview" | "Live" | "Final"

  let detail = "";
  if (state === "Live" && g.linescore) {
    detail = `${g.linescore.inningState || ""} ${g.linescore.currentInningOrdinal || ""}`.trim();
  } else if (state === "Preview") {
    detail = new Date(g.gameDate).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } else if (state === "Final") {
    detail = "Final";
  }

  return {
    state,
    home: isHome,
    opponent: them.team.name,
    teamScore: us.score ?? 0,
    oppScore: them.score ?? 0,
    detail,
  };
}

function renderLiveBannerContent(team, game) {
  if (!game) {
    return `<div class="live-status">No ${team.name} game today.</div>`;
  }
  const label = game.state === "Live" ? "LIVE" : game.state === "Final" ? "FINAL" : "UPCOMING";
  const vs = game.home ? `vs ${game.opponent}` : `@ ${game.opponent}`;
  return `
    <div class="live-status ${game.state === "Live" ? "is-live" : ""}">
      <span class="live-badge">${label}</span>
      <strong>${team.name}</strong> ${vs}
      ${game.state !== "Preview" ? `<span class="live-score">${game.teamScore}–${game.oppScore}</span>` : ""}
      ${game.detail ? `<span class="meta">${game.detail}</span>` : ""}
    </div>
  `;
}

function renderLiveBanner(team) {
  const banner = document.createElement("div");
  banner.className = "live-banner";
  banner.textContent = "Checking for a live game…";

  const update = async () => {
    try {
      const game = await fetchLiveGame(team.liveConfig.teamId);
      banner.innerHTML = renderLiveBannerContent(team, game);
    } catch (err) {
      banner.innerHTML = `<div class="live-status">Live score unavailable right now (${err.message}).</div>`;
    }
  };

  update();
  liveInterval = setInterval(update, 30000);
  return banner;
}

function mlbSeasonYear() {
  return new Date().getFullYear();
}

async function fetchRecentGames(teamId, days = 21) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = d => d.toISOString().slice(0, 10);
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${teamId}&startDate=${fmt(start)}&endDate=${fmt(end)}&hydrate=linescore`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const games = [];
  (data.dates || []).forEach(d => {
    (d.games || []).forEach(g => {
      if (g.status.abstractGameState !== "Final") return;
      const isHome = g.teams.home.team.id === teamId;
      const us = isHome ? g.teams.home : g.teams.away;
      const them = isHome ? g.teams.away : g.teams.home;
      const usScore = us.score ?? 0;
      const themScore = them.score ?? 0;
      const innings = g.linescore && g.linescore.currentInning;
      games.push({
        date: g.gameDate.slice(0, 10),
        opponent: them.team.name,
        home: isHome,
        result: usScore > themScore ? "W" : "L",
        teamScore: usScore,
        oppScore: themScore,
        note: innings && innings !== 9 ? `${innings} innings` : "",
      });
    });
  });

  games.sort((a, b) => (a.date < b.date ? -1 : 1));
  return games.slice(-8);
}

async function fetchStandings(leagueId, divisionId) {
  const season = mlbSeasonYear();
  const url = `https://statsapi.mlb.com/api/v1/standings?leagueId=${leagueId}&season=${season}&standingsTypes=regularSeason`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const division = (data.records || []).find(r => r.division && r.division.id === divisionId);
  if (!division) throw new Error("Division not found");

  const rows = division.teamRecords
    .slice()
    .sort((a, b) => a.divisionRank - b.divisionRank)
    .map(r => {
      const w = r.leagueRecord.wins;
      const l = r.leagueRecord.losses;
      const pct = r.leagueRecord.pct || (w + l > 0 ? (w / (w + l)).toFixed(3).replace(/^0/, "") : ".000");
      return { team: r.team.name, w, l, pct, gb: r.gamesBack };
    });

  return { rows, groupName: division.division.name };
}

async function fetchTeamRoster(teamId) {
  const season = mlbSeasonYear();
  const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active&hydrate=person(stats(type=season,group=[hitting,pitching],season=${season}))`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const roster = data.roster || [];

  const hitters = [];
  const pitchers = [];

  roster.forEach(entry => {
    const person = entry.person || {};
    const posType = (entry.position && entry.position.type) || "";
    const statGroups = person.stats || [];
    const hSplit = statGroups.find(s => s.group && s.group.displayName === "hitting");
    const pSplit = statGroups.find(s => s.group && s.group.displayName === "pitching");
    const hStat = hSplit && hSplit.splits && hSplit.splits[0] && hSplit.splits[0].stat;
    const pStat = pSplit && pSplit.splits && pSplit.splits[0] && pSplit.splits[0].stat;

    if (posType === "Pitcher" && pStat) {
      pitchers.push({
        name: person.fullName,
        pos: (entry.position && entry.position.abbreviation) || "P",
        ip: parseFloat(pStat.inningsPitched || "0"),
        statLine: `${pStat.wins}-${pStat.losses} · ${pStat.era} ERA · ${pStat.strikeOuts} K`,
      });
    } else if (hStat) {
      hitters.push({
        name: person.fullName,
        pos: (entry.position && entry.position.abbreviation) || "",
        ab: hStat.atBats || 0,
        statLine: `${hStat.avg} AVG · ${hStat.homeRuns} HR · ${hStat.rbi} RBI · ${hStat.ops} OPS`,
      });
    }
  });

  hitters.sort((a, b) => b.ab - a.ab);
  pitchers.sort((a, b) => b.ip - a.ip);

  return hitters.slice(0, 4).concat(pitchers.slice(0, 2))
    .map(({ name, pos, statLine }) => ({ name, pos, statLine }));
}

async function attachLiveSection(container, team, sectionKey) {
  if (!team.liveConfig) return;
  const { teamId, leagueId, divisionId } = team.liveConfig;

  try {
    if (sectionKey === "scores") {
      const games = await fetchRecentGames(teamId);
      if (games.length === 0) return;
      container.innerHTML = "";
      const note = document.createElement("div");
      note.className = "live-sync-note";
      note.textContent = "Recent results synced live via MLB Stats API";
      container.appendChild(note);
      container.appendChild(renderScores(Object.assign({}, team, { scores: games })));
    } else if (sectionKey === "standings" && leagueId && divisionId) {
      const { rows, groupName } = await fetchStandings(leagueId, divisionId);
      const liveTeam = Object.assign({}, team, {
        standings: { group: groupName, rows, note: "Live via MLB Stats API" },
      });
      container.innerHTML = "";
      container.appendChild(renderStandings(liveTeam));
    } else if (sectionKey === "players") {
      const players = await fetchTeamRoster(teamId);
      if (players.length === 0) return;
      container.innerHTML = "";
      const note = document.createElement("div");
      note.className = "live-sync-note";
      note.textContent = "Active roster & season stats synced live via MLB Stats API";
      container.appendChild(note);
      container.appendChild(renderPlayers(Object.assign({}, team, { players })));
    }
  } catch (err) {
    console.warn(`Live ${sectionKey} fetch failed, keeping sample data:`, err);
  }
}

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

function renderHistory(team) {
  const wrap = document.createElement("div");

  const source = document.createElement("div");
  source.className = "standings-note";
  source.style.padding = "0 0 10px";
  source.innerHTML = `Source: <a href="${team.historySource.url}" target="_blank" rel="noopener">${team.historySource.label}</a>`;
  wrap.appendChild(source);

  const tableWrap = document.createElement("div");
  tableWrap.className = "table-wrap";
  const rows = team.history.map(s => `
    <tr>
      <td>${s.year}</td>
      <td>${s.lg}</td>
      <td>${s.w}-${s.l}${s.t ? `-${s.t}` : ""}</td>
      <td>${s.finish}</td>
      <td>${s.playoffs || "—"}</td>
      <td>${s.pf}</td>
      <td>${s.pa}</td>
      <td>${s.diff > 0 ? "+" + s.diff : s.diff}</td>
      <td>${s.srs}</td>
      <td>${s.coach}</td>
      <td>${s.passer}</td>
      <td>${s.rusher}</td>
      <td>${s.receiver}</td>
    </tr>
  `).join("");
  tableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Year</th><th>Lg</th><th>W-L-T</th><th>Finish</th><th>Playoffs</th>
          <th>PF</th><th>PA</th><th>Diff</th><th>SRS</th>
          <th>Coach</th><th>Passer</th><th>Rusher</th><th>Receiver</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  wrap.appendChild(tableWrap);
  return wrap;
}

const RENDERERS = {
  scores: renderScores,
  players: renderPlayers,
  schedule: renderSchedule,
  standings: renderStandings,
  history: renderHistory,
};

function renderPanel() {
  stopLivePolling();

  const team = TEAMS[activeTeam];
  const sections = team.history ? BASE_SECTIONS.concat([{ key: "history", label: "History" }]) : BASE_SECTIONS;
  if (!sections.some(s => s.key === activeSection)) activeSection = "scores";

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
  sections.forEach(s => {
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
  if (activeSection === "scores" && team.liveConfig) {
    content.appendChild(renderLiveBanner(team));
  }

  const sectionContainer = document.createElement("div");
  sectionContainer.appendChild(RENDERERS[activeSection](team));
  content.appendChild(sectionContainer);
  panel.appendChild(content);

  if (["scores", "players", "standings"].includes(activeSection)) {
    attachLiveSection(sectionContainer, team, activeSection);
  }
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
