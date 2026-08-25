/*
 * Sample/demo data for the Boston Sports Tracker.
 * This app does not have a live sports-data API connected, so every
 * number below is illustrative placeholder data, not real results.
 * Swap TEAMS[...] fields for a live API feed (e.g. ESPN, SportsRadar,
 * MLB Stats API, balldontlie) to make this a real-time tracker —
 * the UI only depends on the shapes defined here.
 */

const TEAMS = {
  patriots: {
    name: "New England Patriots",
    league: "NFL",
    color: "#0a2342",
    accent: "#c8102e",
    logoText: "NE",
    blurb: "AFC East · Gillette Stadium, Foxborough, MA",
    scores: [
      { date: "2026-08-08", opponent: "Washington Commanders", home: true, result: "W", teamScore: 24, oppScore: 17, note: "Preseason Week 1" },
      { date: "2026-08-15", opponent: "Minnesota Vikings", home: false, result: "L", teamScore: 13, oppScore: 20, note: "Preseason Week 2" },
      { date: "2026-08-22", opponent: "New York Giants", home: true, result: "W", teamScore: 27, oppScore: 21, note: "Preseason Week 3" },
    ],
    schedule: [
      { date: "2026-09-07", opponent: "Las Vegas Raiders", home: true, time: "1:00 PM" },
      { date: "2026-09-14", opponent: "Miami Dolphins", home: false, time: "1:00 PM" },
      { date: "2026-09-21", opponent: "Pittsburgh Steelers", home: true, time: "1:00 PM" },
      { date: "2026-09-28", opponent: "San Francisco 49ers", home: false, time: "4:25 PM" },
      { date: "2026-10-05", opponent: "Buffalo Bills", home: true, time: "8:20 PM" },
      { date: "2026-10-12", opponent: "New Orleans Saints", home: false, time: "1:00 PM" },
    ],
    standings: {
      group: "AFC East",
      rows: [
        { team: "Buffalo Bills", w: 13, l: 4, pct: ".765", gb: "-" },
        { team: "New England Patriots", w: 11, l: 6, pct: ".647", gb: "2.0" },
        { team: "Miami Dolphins", w: 8, l: 9, pct: ".471", gb: "5.0" },
        { team: "New York Jets", w: 5, l: 12, pct: ".294", gb: "8.0" },
      ],
      note: "Final 2025 regular-season standings (most recent completed NFL season)",
    },
    players: [
      { name: "Drake Maye", pos: "QB", statLine: "3,912 yds · 27 TD · 9 INT · 64.8% comp" },
      { name: "Rhamondre Stevenson", pos: "RB", statLine: "1,048 rush yds · 8 TD · 4.4 YPC" },
      { name: "DeMario Douglas", pos: "WR", statLine: "78 rec · 921 yds · 6 TD" },
      { name: "Hunter Henry", pos: "TE", statLine: "62 rec · 704 yds · 7 TD" },
      { name: "Christian Gonzalez", pos: "CB", statLine: "4 INT · 16 PD · 68 tkl" },
      { name: "Matthew Judon", pos: "EDGE", statLine: "10.5 sacks · 38 tkl · 3 FF" },
    ],
  },

  redsox: {
    name: "Boston Red Sox",
    league: "MLB",
    color: "#0d2b56",
    accent: "#bd3039",
    logoText: "BOS",
    blurb: "AL East · Fenway Park, Boston, MA",
    scores: [
      { date: "2026-08-19", opponent: "Tampa Bay Rays", home: true, result: "W", teamScore: 6, oppScore: 3, note: "" },
      { date: "2026-08-20", opponent: "Tampa Bay Rays", home: true, result: "W", teamScore: 4, oppScore: 2, note: "" },
      { date: "2026-08-21", opponent: "Tampa Bay Rays", home: true, result: "L", teamScore: 1, oppScore: 5, note: "" },
      { date: "2026-08-23", opponent: "New York Yankees", home: false, result: "W", teamScore: 7, oppScore: 4, note: "" },
      { date: "2026-08-24", opponent: "New York Yankees", home: false, result: "L", teamScore: 2, oppScore: 3, note: "10 innings" },
    ],
    schedule: [
      { date: "2026-08-25", opponent: "New York Yankees", home: false, time: "1:35 PM" },
      { date: "2026-08-26", opponent: "Baltimore Orioles", home: true, time: "7:10 PM" },
      { date: "2026-08-27", opponent: "Baltimore Orioles", home: true, time: "7:10 PM" },
      { date: "2026-08-28", opponent: "Baltimore Orioles", home: true, time: "1:35 PM" },
      { date: "2026-08-29", opponent: "Toronto Blue Jays", home: false, time: "7:07 PM" },
      { date: "2026-08-30", opponent: "Toronto Blue Jays", home: false, time: "3:07 PM" },
    ],
    standings: {
      group: "AL East",
      rows: [
        { team: "New York Yankees", w: 75, l: 55, pct: ".577", gb: "-" },
        { team: "Boston Red Sox", w: 71, l: 58, pct: ".550", gb: "3.5" },
        { team: "Baltimore Orioles", w: 68, l: 61, pct: ".527", gb: "6.5" },
        { team: "Tampa Bay Rays", w: 63, l: 66, pct: ".488", gb: "11.5" },
        { team: "Toronto Blue Jays", w: 60, l: 69, pct: ".465", gb: "14.5" },
      ],
      note: "Standings as of Aug 25, 2026",
    },
    players: [
      { name: "Rafael Devers", pos: "3B", statLine: ".289 AVG · 32 HR · 94 RBI · .932 OPS" },
      { name: "Jarren Duran", pos: "OF", statLine: ".278 AVG · 41 SB · 12 HR · .811 OPS" },
      { name: "Triston Casas", pos: "1B", statLine: ".251 AVG · 24 HR · 71 RBI · .845 OPS" },
      { name: "Ceddanne Rafaela", pos: "SS", statLine: ".266 AVG · 15 HR · 8 SB" },
      { name: "Brayan Bello", pos: "SP", statLine: "12-8 · 3.61 ERA · 154 K" },
      { name: "Garrett Whitlock", pos: "RP", statLine: "2.94 ERA · 21 SV · 68 K" },
    ],
  },

  celtics: {
    name: "Boston Celtics",
    league: "NBA",
    color: "#0c2340",
    accent: "#007a33",
    logoText: "BOS",
    blurb: "Eastern Conference · TD Garden, Boston, MA",
    scores: [
      { date: "2026-05-04", opponent: "New York Knicks", home: true, result: "W", teamScore: 112, oppScore: 98, note: "Playoffs R2 G1" },
      { date: "2026-05-06", opponent: "New York Knicks", home: true, result: "W", teamScore: 105, oppScore: 101, note: "Playoffs R2 G2" },
      { date: "2026-05-09", opponent: "New York Knicks", home: false, result: "L", teamScore: 94, oppScore: 108, note: "Playoffs R2 G3" },
      { date: "2026-05-11", opponent: "New York Knicks", home: false, result: "W", teamScore: 117, oppScore: 110, note: "Playoffs R2 G4" },
      { date: "2026-05-13", opponent: "New York Knicks", home: true, result: "W", teamScore: 121, oppScore: 103, note: "Playoffs R2 G5 - Series clinched" },
    ],
    schedule: [
      { date: "2026-10-22", opponent: "New York Knicks", home: true, time: "7:30 PM", note: "Season Opener" },
      { date: "2026-10-24", opponent: "Washington Wizards", home: false, time: "7:00 PM" },
      { date: "2026-10-26", opponent: "Miami Heat", home: true, time: "6:00 PM" },
      { date: "2026-10-29", opponent: "Philadelphia 76ers", home: true, time: "7:30 PM" },
      { date: "2026-10-31", opponent: "Milwaukee Bucks", home: false, time: "8:00 PM" },
      { date: "2026-11-02", opponent: "Cleveland Cavaliers", home: false, time: "6:00 PM" },
    ],
    standings: {
      group: "Eastern Conference",
      rows: [
        { team: "Boston Celtics", w: 58, l: 24, pct: ".707", gb: "-" },
        { team: "Cleveland Cavaliers", w: 55, l: 27, pct: ".671", gb: "3.0" },
        { team: "New York Knicks", w: 52, l: 30, pct: ".634", gb: "6.0" },
        { team: "Milwaukee Bucks", w: 47, l: 35, pct: ".573", gb: "11.0" },
        { team: "Philadelphia 76ers", w: 44, l: 38, pct: ".537", gb: "14.0" },
      ],
      note: "Final 2025-26 regular-season standings (most recent completed NBA season)",
    },
    players: [
      { name: "Jayson Tatum", pos: "F", statLine: "27.8 PPG · 8.4 RPG · 4.9 APG" },
      { name: "Jaylen Brown", pos: "G/F", statLine: "23.6 PPG · 5.5 RPG · 3.6 APG" },
      { name: "Derrick White", pos: "G", statLine: "16.2 PPG · 4.1 APG · 1.4 SPG" },
      { name: "Kristaps Porzingis", pos: "C", statLine: "19.4 PPG · 7.1 RPG · 1.9 BPG" },
      { name: "Jrue Holiday", pos: "G", statLine: "12.9 PPG · 4.8 APG · 1.1 SPG" },
      { name: "Payton Pritchard", pos: "G", statLine: "14.3 PPG · 3.7 APG · 41% 3PT" },
    ],
  },
};
