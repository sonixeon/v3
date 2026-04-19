# ARIF-BABU Facebook Messenger Bot

## Overview
A feature-rich Facebook Messenger bot with a web dashboard. The bot handles commands like AI chat, media downloading, group management, games, and more.

## Tech Stack
- **Runtime:** Node.js 20.x
- **Package Manager:** npm
- **Web Framework:** Express.js (dashboard/uptime server)
- **Facebook API:** fca-priyansh (Facebook Chat API wrapper)
- **Database:** SQLite3 via Sequelize ORM
- **Key Libraries:** axios, canvas, jimp, openai, ytdl-core, moment-timezone

## Project Structure
- `index.js` — Entry point: starts Express dashboard on port 5000, monitors and auto-restarts bot
- `ARIF-BABU.js` — Core bot engine
- `config.json` — Bot settings (prefix, admin IDs, API options)
- `appstate.json` — Facebook session cookies (must be populated to run bot)
- `models/commands/` — Dynamically loaded command files
- `models/events/` — Event handlers
- `includes/` — Database controllers, handlers, listeners
- `utils/` — Utility functions (logging, etc.)
- `languages/` — Localization files
- `index.html` — Web dashboard served by Express

## Running the App
- **Start command:** `npm start` (runs `node index.js`)
- **Port:** 5000 (Express dashboard, bound to 0.0.0.0)
- The web dashboard is always available; the bot requires `appstate.json` to be populated with valid Facebook session cookies

## Configuration
- `config.json` — Bot prefix, admin IDs, version, API options
- `appstate.json` — Facebook session cookies for authentication (sensitive)

## Deployment
- **Target:** VM (always-running, needed for persistent bot connection)
- **Run command:** `node index.js`
