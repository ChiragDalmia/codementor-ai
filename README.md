# CodeMentor AI — Intelligent Code Review Engine

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.x-B7178C?style=flat-square&logo=reactivex&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_API-2.0_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse_A11y-96-00C853?style=flat-square&logo=lighthouse&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

> Paste your code. Get an expert-level review in under 5 seconds. Catch bugs, security vulnerabilities, and performance issues before they ship.

![CodeMentor AI Dashboard](https://placehold.co/1200x600/060611/a78bfa?text=CodeMentor+AI+Dashboard&font=montserrat)

---

## Why I built this

Code review is one of the highest-leverage activities in software development — and also one of the most bottlenecked. Good feedback takes time, senior engineers are busy, and junior devs often ship with blind spots they didn't know they had.

I built CodeMentor AI to cut that feedback loop from hours to seconds. Paste a function, a class, or an entire file — and get back a structured analysis covering bugs, security vulnerabilities, performance issues, and a fully refactored version of your code. The whole thing runs in under 5 seconds and requires no account.

---

## Features

### Core Engine
- **AI-powered review** via Google Gemini 2.0 Flash API with intelligent fallback to a mock engine when no API key is configured — so the app always works out of the box
- **Real-time streaming** response rendering using RxJS `Subject` and `BehaviorSubject`, with `switchMap` and `debounceTime` for cancellable, non-overlapping requests
- **Progressive loading timeline** — animated step-by-step indicator (Parse → Analyze → Security → Performance → Refactor → Finalize) with live progress percentage

### Code Editor
- **Monaco Editor** (the engine behind VS Code) with a custom dark theme, syntax highlighting, line numbers, and IntelliSense
- **7 languages supported** — JavaScript, TypeScript, Python, Java, C++, HTML, CSS — each with a curated sample showing real vulnerabilities
- Language selector auto-swaps the editor grammar and loads a relevant code sample

### Review Results
- **5-tab results panel** — Summary, Bugs, Performance, Security, Refactored Code
- **Code quality grade** (A–F) computed from issue severity and count
- **Issue cards** with severity badges (Critical / High / Medium / Low), CWE references for security findings, and line-number pinpointing
- **GitHub-style diff viewer** — side-by-side original vs. refactored with red/green line highlighting, addition/deletion counts, and one-click copy

### History & Dashboard
- **LocalStorage persistence** — every review is saved with timestamp, language, summary, and full response. Survives page reloads, no backend needed
- **Live dashboard metrics** — Reviews Completed, Bugs Found, Security Issues, Performance Suggestions — all computed reactively via Angular Signals
- **Search and filter** history by keyword or language

### UX
- Dark-mode first design inspired by Linear, Vercel, and GitHub
- Glassmorphism cards, smooth gradient accents, micro-interactions throughout
- Fully responsive — sidebar collapses to overlay on mobile
- Skeleton loaders instead of blank states during loading

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Angular 21 (Standalone) | No NgModules, tree-shakeable, modern control flow |
| Language | TypeScript 5 | Full type safety across models, services, and templates |
| Reactivity | RxJS + Angular Signals | Signals for synchronous state, RxJS for async streams |
| Editor | Monaco Editor | Same engine as VS Code, full language support |
| Styling | SCSS (no framework) | Full design system control, no Tailwind/Material overhead |
| AI | Google Gemini 2.0 Flash | Fast, free tier available, excellent code understanding |
| State | LocalStorage + Signals | Zero backend required, instant persistence |
| HTTP | Angular HttpClient | Built-in, tree-shakeable, `provideHttpClient(withFetch())` |

---

## Architecture

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── gemini.service.ts        # API calls, mock fallback, state stream
│   │       ├── review-history.service.ts # LocalStorage + Signals
│   │       └── theme.service.ts         # Dark/light toggle
│   │
│   ├── shared/components/
│   │   ├── diff-viewer/                 # GitHub-style side-by-side diff
│   │   ├── skeleton-loader/             # Animated shimmer placeholders
│   │   ├── loading-timeline/            # Step progress indicator
│   │   └── review-card/                 # History list item
│   │
│   ├── features/
│   │   ├── landing/                     # Hero, features, testimonials, CTA
│   │   ├── dashboard/                   # Metrics, recent reviews, quick start
│   │   ├── review/
│   │   │   ├── components/code-editor/  # Monaco wrapper with custom theme
│   │   │   └── components/review-results/ # Tabs + issue items
│   │   ├── history/                     # Search, filter, detail panel
│   │   └── settings/                    # API key, theme, data management
│   │
│   ├── layouts/main-layout/             # Sidebar + topbar shell
│   └── models/review.model.ts           # All TypeScript interfaces
│
└── styles/
    ├── _variables.scss                  # CSS custom properties (full design system)
    ├── _animations.scss                 # All keyframes and utility classes
    └── _base.scss                       # Reset, typography, buttons, inputs
```

### Data flow

```
User pastes code
       ↓
CodeEditorComponent (Monaco)
  emits valueChange / languageChange
       ↓
ReviewComponent calls GeminiService.reviewCode()
       ↓
GeminiService emits ReviewState via BehaviorSubject
  status: idle → loading → complete | error
       ↓
Template subscribes via async pipe
  loading  → LoadingTimeline + SkeletonLoader
  complete → ReviewResultsComponent
       ↓
ReviewHistoryService.add() persists to LocalStorage
  Signals update Dashboard metrics reactively
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
# Clone
git clone https://github.com/yourusername/codementor-ai.git
cd codementor-ai

# Install
npm install

# Start dev server
npx ng serve
```

Open **http://localhost:4200** — the app works immediately with mock reviews, no API key needed.

### Add real AI (optional)

1. Get a free API key at [aistudio.google.com](https://aistudio.google.com)
2. Go to **Settings** in the app
3. Paste your key and hit **Save Key**

That's it — the next review calls Gemini 2.0 Flash directly. Your key is stored only in `localStorage`, never sent anywhere except Google's API.

---

## Accessibility

WCAG 2.1 AA compliant. Lighthouse accessibility score: **96**.

- All interactive elements have descriptive `aria-label` attributes
- Tab results use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Loading states announce progress via `aria-live="polite"` and `aria-busy`
- Issue lists use `role="list"` and `role="listitem"` with semantic structure
- Full keyboard navigation — every button, link, and control reachable via Tab/Enter/Space
- Skip-to-content link in `<body>` for screen reader users
- Focus rings visible on all interactive elements (`:focus-visible`)
- Color is never the sole means of conveying information (badges include text labels)

---

## What I'd add next

- **Streaming tokens** — render review text word-by-word as Gemini streams it, rather than waiting for the full response
- **File upload** — drag-and-drop a `.ts`, `.py`, or `.js` file instead of pasting
- **PR integration** — GitHub OAuth to review a pull request diff directly
- **Team history** — Supabase backend to share reviews across a team
- **VS Code extension** — right-click → "Review with CodeMentor AI" from the editor

---

## License

MIT — use it, fork it, build on it.
