<div align="center">

# Anna's Desk

**A personal planning PWA for 1A university life**

Track classes, habits, workouts, recipes, notes, and key dates without juggling ten different apps.

[![Live Demo](https://img.shields.io/badge/Live-Demo-c4622d?style=for-the-badge&logo=googlechrome&logoColor=white)](https://dnsva.github.io/anna-s-desk/)
&nbsp;
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white&labelColor=1C1C1C)
![PWA](https://img.shields.io/badge/PWA-offline--ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-181717?style=flat-square&logo=github)

![Dashboard overview showing today card, habit progress, and section tiles](docs/assets/gifs/dashboard.gif)

</div>

---

## What's inside

| | Section | What it does |
|---|---|---|
| 🏠 | Today's Dashboard | Next class, habit ratio, workout type, and quick links to every section |
| 📦 | Move-in Checklist | 68-item categorized packing list with live progress bar |
| 📅 | Class Schedule | Color-coded weekly timetable with room numbers and time ranges |
| 🗓️ | Key Dates | Countdown chips that change color by urgency |
| 🍳 | Recipes | Two-tab dorm recipe collection with full ingredient and step detail views |
| 💪 | Workout Planner | 7-day split with scheme chips you can edit inline |
| ✅ | Habits | Daily habit tracker with streaks and a completion progress bar |
| 📷 | Photo Board | Masonry photo grid with inline captions |
| 📝 | Notes | Rich-text editor with highlights, lists, and keyboard shortcuts |
| 🗑️ | Trash | 7-day soft-delete recovery for notes, recipes, habits, and more |

---

## Features

### Today's Dashboard

Opens to a greeting card with the current date, your next class (with room and time), today's habit completion ratio, and today's workout type. Section tiles below give one-tap access to all ten areas with live summaries like "9 of 68 packed" and "5 saved" so you always know where things stand.

![Dashboard showing next-class card, habit counter, and section tiles](docs/assets/gifs/dashboard.gif)

---

### Move-in Checklist

68 items pre-loaded across categories (clothing, tech, bedding, kitchen, bathroom, and more). A progress bar across the top fills as you check things off. Each item can be marked packed, renamed, or deleted. Deleted items land in Trash for a 7-day recovery window.

![Checklist scrolling through categories with items checked off](docs/assets/gifs/checklist.gif)

---

### Class Schedule

A weekly timetable with a column per day and color-coded class cards showing course name, time range, and room number. Opening the add form lets you set name, day, start and end times, and location. Pre-loaded with a realistic 1A ECE schedule at Waterloo.

![Schedule showing weekly timetable and add-class form](docs/assets/gifs/schedule.gif)

---

### Key Dates

A list of upcoming events with live countdown chips. Chips turn terracotta when a date is within 3 days, gold for upcoming, and muted grey once it has passed. Add any event with a name and date.

![Key dates list with color-coded countdown badges](docs/assets/gifs/key-dates.gif)

---

### Recipes

Two tabs (Food and Drinks) for dorm-friendly recipes. Each card shows prep time and ingredient count. Tapping one opens a full detail view with a numbered ingredients list and step-by-step instructions. Recipes can be added, edited, and deleted.

![Recipes switching tabs and opening a full recipe view](docs/assets/gifs/recipes.gif)

---

### Workout Planner

A 7-day split (Mon to Sun) where each day has its own exercise list. Every exercise shows the current scheme (sets, reps, weight) as salmon-colored chips. Tap any chip to open an inline text editor, type a new scheme, and press Enter to commit. Check off exercises as you finish them. The counter at the top right tracks how many are done.

![Workout planner with day tabs, exercise checkboxes, and inline scheme editing](docs/assets/gifs/workout.gif)

---

### Habits

Daily habits with streak counters and a shared progress bar. Tap the circle next to a habit to mark it done for today. The streak counter increments on consecutive days. A summary at the top shows how many habits are complete. Add new habits from the form at the bottom.

![Habits section with toggles, streaks, and progress bar](docs/assets/gifs/habits.gif)

---

### Photo Board

A masonry photo grid for campus moments, dorm setups, or anything worth remembering. Upload photos from your device; they display in a warm 4-column grid (responsive down to 2 columns on mobile). Each photo has an optional caption you can edit inline.

![Photo board showing three photos in a masonry grid with captions](docs/assets/gifs/photos.gif)

---

### Notes

A rich-text editor backed by `contenteditable`. The toolbar supports bold, italic, underline, strikethrough, bullet lists, numbered lists, and five highlight colors (yellow, green, blue, pink, orange). Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U) work without losing your selection. Notes auto-save on every keystroke.

![Notes editor with formatting toolbar, highlighted text, and bullet list](docs/assets/gifs/notes.gif)

---

### Trash

Soft-deleted items from Notes, Recipes, Checklist, Key Dates, and Habits collect here. Each item shows its type, name, and an expiry countdown (7 days from deletion). Tap Restore to return an item to its original section. Tap Delete to remove it immediately.

![Trash section showing deleted note, recipe, and habit with restore buttons](docs/assets/gifs/trash.gif)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 (via CDN, no build step) |
| Component runtime | dc-runtime (custom JSX-to-DOM compiler) |
| Database | Supabase (PostgreSQL) for cloud sync |
| Offline persistence | localStorage (`collegeApp_v4`) |
| Service worker | Vanilla JS, cache-first PWA shell |
| Fonts | Newsreader, Work Sans, Caveat (Google Fonts) |
| Hosting | GitHub Pages |

No Node.js, no bundler, no build pipeline. The app is a single `index.html` plus a compiled `support.js` runtime and nine section modules. Clone it and open a file server.

---

## Running Locally

```bash
git clone https://github.com/dnsva/anna-s-desk.git
cd anna-s-desk
python3 -m http.server 8765 --directory ..
```

Then open [http://localhost:8765/anna-s-desk/](http://localhost:8765/anna-s-desk/).

The app works fully offline using localStorage. Supabase cloud sync uses the credentials already baked into `index.html` and will sync automatically if the network is available.

---

## Data and Sync

All data lives in `localStorage` under the key `collegeApp_v4`. On load the app tries to pull the latest snapshot from Supabase and updates the local store if cloud data is newer. Changes are pushed to Supabase automatically after every save. If the network is unavailable the app continues working offline and shows a sync status indicator in the sidebar footer.

Soft-deleted items in Trash are retained for 7 days and then purged automatically on the next app load.
