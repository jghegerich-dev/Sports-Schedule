# My Projects

A workspace for multiple, unrelated projects living side by side in one repo.

## Structure

Each project is a self-contained folder at the repo root with its own entry
point (`index.html`, or whatever the project needs). Projects don't share
code or depend on each other.

```
My-Projects/
├── home.html              # hub — lists every project, generated from projects.js
├── projects.js             # registry: one entry per project
├── sports-tracker/         # project: Boston Sports Tracker
└── platinum-leaderboard/   # project: PS Platinum Leaderboard
```

## Adding a new project

1. Create a new folder at the repo root for it (any stack — static HTML,
   a build tool, a script — as long as it's self-contained in that folder).
2. Add an entry to `projects.js` with an id, title, description, icon, and
   the path to its entry point.

That's it — the project shows up on `home.html` automatically, no other
file needs to change.
