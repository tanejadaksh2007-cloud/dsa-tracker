# AlgoForge 🎯

**Forge Your Problem-Solving Skills.**

A clean, offline-first progress tracker for DSA interview prep — built for students targeting campus placements and technical interviews.

**Live demo:** `https://YOUR-USERNAME.github.io/dsa-tracker` *(base URL `/dsa-tracker/` preserved for deployment compatibility)*

## What it does

- **10 topics** covering everything from Arrays to Dynamic Programming, ordered by dependency
- **Readiness score** per topic — weighted by problem difficulty (hard = 3×, medium = 2×, easy = 1×). Attempted problems count at 40%
- **80% threshold** tells you exactly when it's time to move on
- **Concept hints** on every problem — the core insight, not a solution spoiler
- **Direct LeetCode links** for every problem
- **Progress persists** in `localStorage` — works offline, no account needed

---

## Deploy to GitHub Pages in 5 steps

### 1. Create a GitHub repository

Go to [github.com/new](https://github.com/new) and create a new public repository named `dsa-tracker`.

### 2. Upload the files

Upload these 4 files to the repository root:
```
index.html
style.css
app.js
data.js
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch, **/ (root)** folder
4. Click **Save**

### 4. Wait ~60 seconds

GitHub will build and deploy. Your app will be live at:
```
https://YOUR-USERNAME.github.io/dsa-tracker
```

### 5. Bookmark it / share it

That's your permanent URL. Share with friends. Works on mobile too.

---

## Updating content

All topics and questions live in **`data.js`**. Edit it to:

### Add a question to an existing topic
```js
// Inside any topic's sections array:
{
  name: "Two Sum III",
  tag: "medium",
  leetcode: "https://leetcode.com/problems/...",
  concept: "Your concept explanation here."
}
```

### Add a new topic
```js
{
  id: "tries",           // unique id, no spaces
  name: "Tries",         // display name
  icon: "⊤",            // any single character or symbol
  prereq: "trees",       // id of prerequisite topic, or null
  why: "Why this matters for placements.",
  sections: [
    {
      title: "Core mechanics",
      questions: [ /* ... */ ]
    }
  ]
}
```

After editing `data.js`, commit the file — GitHub Pages auto-deploys in ~30 seconds.

---

## Tech stack

- Vanilla HTML + CSS + JavaScript — zero dependencies, zero build step
- `localStorage` for persistence — works offline
- Hosted free on GitHub Pages forever

---

## Topic roadmap

| Order | Topic | Prerequisite |
|-------|-------|-------------|
| 1 | Arrays & Strings | — |
| 2 | Hashing | Arrays |
| 3 | Stacks | Arrays |
| 4 | Queues & Deques | Stacks |
| 5 | Linked Lists | Arrays |
| 6 | Binary Search | Arrays |
| 7 | Trees & BSTs | Linked Lists |
| 8 | Heaps & Priority Queues | Trees |
| 9 | Graphs | Trees |
| 10 | Dynamic Programming | Arrays |
