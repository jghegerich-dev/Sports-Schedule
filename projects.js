/*
 * Registry of projects in this repo. Add a project here and it shows up
 * on the hub (home.html) automatically — no other file needs to change.
 *
 *   id:          unique slug, matches the project's folder name
 *   title:       display name
 *   description: one line shown on the hub card
 *   path:        entry point, relative to the repo root
 *   icon:        one emoji shown on the card
 *   gradient:    [startColor, endColor] for the card icon background
 */

const PROJECTS = [
  {
    id: "sports-tracker",
    title: "Boston Sports Tracker",
    description: "Scores, player stats, schedule, and standings for the Patriots, Red Sox, and Celtics.",
    path: "sports-tracker/index.html",
    icon: "🏈",
    gradient: ["#0c2340", "#bd3039"],
  },
  {
    id: "platinum-leaderboard",
    title: "Platinum Leaderboard",
    description: "A scored leaderboard for PlayStation platinum trophies, weighted by difficulty, time, and rarity.",
    path: "platinum-leaderboard/index.html",
    icon: "🏆",
    gradient: ["#003791", "#0070d1"],
  },
];
