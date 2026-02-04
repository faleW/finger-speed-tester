# Finger Speed Tracker

A simple desktop/web application to track and visualize your finger speed. It helps you analyze performance over time and stay organized with testing profiles. I develop mainly to track my osu! stream and single tapping speed.

> I originally developed this app to track my osu! streaming and single tapping speed.

## ✨ Features

1. Test your finger speed
2. Add different profiles for you to category depending on your testing purposes (e.g. separate stream 400 clicks and single tap 200 clicks)
3. Visualize your latest and historical testing data
4. Export and Import Data (Not implemented)

## 📌  Road Map

1. Support multiple keys (Currently support 2 keys only)
2. Export and Import Data
   - Export to csv or json
   - Import custom json from export function

## 🚀 Useful commands

### Start dev server

```
pnpm run tauri dev
```

### Build executable

```
pnpm run tauri build
```

## ⚙️ Tech Stack

1. Svelte + Sveltekit - UI and UI Routing
2. Tauri - Desktop Application
3. Dexie.js - Indexed DB to collect historical data

## 📝 License

MIT License — free for personal and commercial use.
