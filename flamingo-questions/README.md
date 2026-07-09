# Flamingo Questions 🦩

A conversation-starter deck for couples — swipe through categorized questions to
get to know each other better, laugh together, and go deeper.

## Categories

- **Warm Up** — light, easy questions to break the ice
- **Getting to Know You** — the basics that build a fuller picture of each other
- **Deep Connection** — values, fears, and what really matters
- **Fun & Playful** — silly, lighthearted questions
- **Date Night** — romance, attraction, feeling loved
- **Future Together** — dreams, goals, where you're headed
- **Trust & Vulnerability** — closeness, honesty, being truly seen
- **Communication** — how you handle friction and support each other

~80 questions total, in `src/data/questions.ts`. Add more by appending to the
`questions` array (each needs a unique `id` and a `categoryId` matching one of
the entries in `categories`), or add a whole new category.

## Features

- Shuffle all questions, or browse one category at a time
- Save favorite questions (stored in `localStorage`) and review them later
- Mobile-first, swipe-friendly card UI

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Deploy

This is a static Vite app — deploy the `dist/` folder to Netlify, Vercel,
GitHub Pages, or any static host. Build command: `npm run build`, publish
directory: `dist`.
