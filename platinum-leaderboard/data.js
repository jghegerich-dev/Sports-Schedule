/*
 * Sample/demo data for the Platinum Leaderboard.
 * There is no live PSN/PSNProfiles API connected here — PSNProfiles does
 * not offer a public API and disallows scraping, so every number below
 * (difficulty, avg hours, rarity %) is illustrative placeholder data
 * modeled after the kind of stats that site tracks, not scraped or real.
 *
 * To make this live you would need a legitimate data source, e.g.:
 *   - Sony's official PSN Trophies API (requires PSN auth + partner access)
 *   - A manual/CSV import of a user's own exported trophy data
 * The UI and scoring engine only depend on the shapes defined here, so
 * swapping in real data is just a matter of populating GAMES and USERS.
 */

// ---- Scoring engine ---------------------------------------------------
//
// PlatinumScore = BASE_POINTS x DifficultyMultiplier x TimeMultiplier x RarityMultiplier
//
// - DifficultyMultiplier: community difficulty rating, 1 (trivial) to 10 (brutal)
// - TimeMultiplier: bucketed by average hours-to-platinum
// - RarityMultiplier: bucketed by % of trophy hunters who earned the platinum,
//   using PSNProfiles' own rarity tier naming (Common/Uncommon/Rare/Very Rare/Ultra Rare)

const BASE_PLATINUM_POINTS = 100;

function difficultyMultiplier(difficulty) {
  // 1 -> 0.7x, 10 -> 2.5x
  return 0.7 + (difficulty - 1) * 0.2;
}

const TIME_BUCKETS = [
  { max: 5, mult: 1.0, label: "< 5 hrs" },
  { max: 15, mult: 1.25, label: "5–15 hrs" },
  { max: 30, mult: 1.5, label: "15–30 hrs" },
  { max: 60, mult: 1.85, label: "30–60 hrs" },
  { max: 100, mult: 2.25, label: "60–100 hrs" },
  { max: Infinity, mult: 2.75, label: "100+ hrs" },
];

function timeMultiplier(avgHours) {
  return TIME_BUCKETS.find(b => avgHours < b.max).mult;
}

function timeBucketLabel(avgHours) {
  return TIME_BUCKETS.find(b => avgHours < b.max).label;
}

const RARITY_TIERS = [
  { min: 50, mult: 1.0, label: "Common" },
  { min: 25, mult: 1.15, label: "Uncommon" },
  { min: 10, mult: 1.35, label: "Rare" },
  { min: 5, mult: 1.6, label: "Very Rare" },
  { min: 0, mult: 2.0, label: "Ultra Rare" },
];

function rarityMultiplier(rarityPct) {
  return RARITY_TIERS.find(t => rarityPct >= t.min).mult;
}

function rarityLabel(rarityPct) {
  return RARITY_TIERS.find(t => rarityPct >= t.min).label;
}

function computeGameScore(game) {
  const diffMult = difficultyMultiplier(game.difficulty);
  const timeMult = timeMultiplier(game.avgHours);
  const rareMult = rarityMultiplier(game.rarityPct);
  const score = Math.round(BASE_PLATINUM_POINTS * diffMult * timeMult * rareMult);
  return { score, diffMult, timeMult, rareMult };
}

// ---- Game catalog -------------------------------------------------------

const GAMES = [
  { id: "astros-playroom", title: "Astro's Playroom", platform: "PS5", difficulty: 2, avgHours: 4, rarityPct: 45 },
  { id: "ratchet-rift-apart", title: "Ratchet & Clank: Rift Apart", platform: "PS5", difficulty: 3, avgHours: 12, rarityPct: 35 },
  { id: "spiderman-2", title: "Marvel's Spider-Man 2", platform: "PS5", difficulty: 3, avgHours: 20, rarityPct: 30 },
  { id: "plague-tale-requiem", title: "A Plague Tale: Requiem", platform: "PS5", difficulty: 3, avgHours: 18, rarityPct: 28 },
  { id: "gow-ragnarok", title: "God of War Ragnarök", platform: "PS5", difficulty: 4, avgHours: 35, rarityPct: 20 },
  { id: "horizon-forbidden-west", title: "Horizon Forbidden West", platform: "PS5", difficulty: 4, avgHours: 45, rarityPct: 18 },
  { id: "stardew-valley", title: "Stardew Valley", platform: "PS4/PS5", difficulty: 5, avgHours: 100, rarityPct: 10 },
  { id: "hades", title: "Hades", platform: "PS4/PS5", difficulty: 6, avgHours: 60, rarityPct: 12 },
  { id: "demons-souls", title: "Demon's Souls", platform: "PS5", difficulty: 8, avgHours: 70, rarityPct: 5 },
  { id: "elden-ring", title: "Elden Ring", platform: "PS4/PS5", difficulty: 8, avgHours: 80, rarityPct: 8 },
  { id: "hollow-knight", title: "Hollow Knight", platform: "PS4/PS5", difficulty: 8, avgHours: 55, rarityPct: 4 },
  { id: "bloodborne", title: "Bloodborne", platform: "PS4", difficulty: 9, avgHours: 60, rarityPct: 6 },
  { id: "crash-4", title: "Crash Bandicoot 4: It's About Time", platform: "PS4/PS5", difficulty: 9, avgHours: 45, rarityPct: 2.5 },
  { id: "nioh-2", title: "Nioh 2", platform: "PS4/PS5", difficulty: 9, avgHours: 150, rarityPct: 3 },
  { id: "rocket-league", title: "Rocket League", platform: "PS4/PS5", difficulty: 9, avgHours: 300, rarityPct: 1 },
  { id: "mlb-the-show-24", title: "MLB The Show 24", platform: "PS4/PS5", difficulty: 9, avgHours: 400, rarityPct: 0.8 },
];

const GAMES_BY_ID = Object.fromEntries(GAMES.map(g => [g.id, g]));

// ---- Users / leaderboard --------------------------------------------------

const USERS = [
  {
    id: "u1", psnId: "TheCompletionist88", joined: "2016",
    platinums: GAMES.map((g, i) => ({ gameId: g.id, date: `2024-0${(i % 9) + 1}-1${i % 9}` })),
  },
  {
    id: "u2", psnId: "TrophyHunterX", joined: "2018",
    platinums: ["elden-ring", "bloodborne", "demons-souls", "nioh-2", "hollow-knight", "rocket-league", "gow-ragnarok", "spiderman-2"]
      .map(id => ({ gameId: id, date: "2024-05-01" })),
  },
  {
    id: "u3", psnId: "GrindQueen", joined: "2019",
    platinums: ["rocket-league", "mlb-the-show-24", "stardew-valley", "nioh-2", "hades"]
      .map(id => ({ gameId: id, date: "2024-06-01" })),
  },
  {
    id: "u4", psnId: "SoulsMaster_JP", joined: "2015",
    platinums: ["elden-ring", "bloodborne", "demons-souls", "nioh-2", "hollow-knight"]
      .map(id => ({ gameId: id, date: "2023-11-01" })),
  },
  {
    id: "u5", psnId: "IndieExplorer", joined: "2020",
    platinums: ["hollow-knight", "hades", "stardew-valley", "plague-tale-requiem", "astros-playroom"]
      .map(id => ({ gameId: id, date: "2024-02-01" })),
  },
  {
    id: "u6", psnId: "CasualCollector99", joined: "2021",
    platinums: ["astros-playroom", "ratchet-rift-apart", "spiderman-2", "plague-tale-requiem", "stardew-valley"]
      .map(id => ({ gameId: id, date: "2024-07-01" })),
  },
  {
    id: "u7", psnId: "WeekendGamer", joined: "2022",
    platinums: ["astros-playroom", "horizon-forbidden-west", "gow-ragnarok"]
      .map(id => ({ gameId: id, date: "2024-08-01" })),
  },
  {
    id: "u8", psnId: "PlatinumRookie", joined: "2024",
    platinums: ["astros-playroom", "ratchet-rift-apart"]
      .map(id => ({ gameId: id, date: "2024-08-10" })),
  },
];

function computeUserStats(user) {
  const entries = user.platinums
    .map(p => {
      const game = GAMES_BY_ID[p.gameId];
      if (!game) return null;
      const { score } = computeGameScore(game);
      return { game, date: p.date, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const totalScore = entries.reduce((sum, e) => sum + e.score, 0);
  const count = entries.length;
  const avgDifficulty = count ? entries.reduce((sum, e) => sum + e.game.difficulty, 0) / count : 0;
  const hardestPlat = entries[0] || null;

  return { user, entries, totalScore, count, avgDifficulty, hardestPlat };
}

function getLeaderboard() {
  return USERS.map(computeUserStats).sort((a, b) => b.totalScore - a.totalScore);
}
