# SPEC — tanjal's personal site (Neovim · Rosé Pine)

> Living spec for AI-augmented development. The agent reads this file at the start of every session.
> **LOCKED** sections are decided — do not relitigate. **OPEN** items need owner input (§14).
> Companion files: `CLAUDE.md` (points here), `NOTES.md` (agent scratchpad + current milestone).

## 1. Concept — LOCKED

The site **is a Neovim session**. Not "terminal-inspired" — a faithful recreation of the chrome: a file-explorer sidebar (the site is a project tree; every page is a file in it), a bufferline across the top showing the buffers you've opened, a content area with a line-number gutter, a lualine-style statusline, and a command-line row. The single signature: **the chrome is functional**. The site answers to vim keys, `:` opens a working command-line, and a Telescope-style fuzzy finder navigates everything.

Spend all boldness there. Everything else is disciplined: real content in semantic HTML, no gimmicks, fast.

**Content convention — LOCKED:** the buffers hold what good engineers' personal sites conventionally hold — intro, about, now, reading, resume, contact — nothing invented for the theme's sake. The Neovim chrome is a presentation layer over a conventional site; if a well-regarded engineer's personal site wouldn't have a section, this site doesn't either.

**Audience & the 30-second job:** engineers and recruiters (infra/data-systems companies) — but the site is built to feel like its owner, not to argue a case. In 30 seconds: who he is, what he's building and reading right now, and where the deep artifacts live (resume, Hedwig landing page + paper) one click away. The craft of the site is the credential; the content is a living snapshot, not a portfolio.

**Forbidden (anti-cringe guardrails):** CRT scanlines/noise, typing animations on real content, fake boot sequences, blinking-cursor spam, autoplaying anything, "I use arch btw" copy, shipping a Nerd Font webfont, ASCII walls as body text. Humor budget: the chrome itself + exactly two easter eggs (`:q`, `:set ascii`). All prose is earnest and professional.

## 2. Tech stack — LOCKED

Identical workflow to the previous portfolio project (deliberate — it transfers):

| Concern       | Choice                                                                         | Note                                                                                       |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Framework     | **Astro** (current major), `output: 'static'`                                  | `site` in `astro.config.mjs` set to the real domain in **M0** — not a placeholder          |
| Styling       | **Tailwind v4** via `pnpm astro add tailwind`                                  | All colors from CSS variables (§5); no raw hex in components                               |
| Content       | Markdown/MDX pages only                                                        | Small site; nothing to model                                                               |
| Interactivity | **One island**: the keyboard/command layer (§7). Vanilla inside it; no UI libs | Fuzzy match over ~25 items needs no dependency                                             |
| Font          | **Iosevka** via Fontsource, latin subset, weights 400/700, woff2 only          | Fallback: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Budget ≤ 120KB total |
| Icons/glyphs  | Plain unicode (`●`, `│`, `↗`, `~`) or inline SVG                               | **Never** a Nerd Font — private-use glyphs break on fallback and cost megabytes            |
| Images        | `astro:assets`                                                                 | Headshot: webp/avif, explicit dimensions                                                   |
| Hosting       | Vercel or Cloudflare Pages, deploy from `main`                                 | —                                                                                          |
| Tooling       | pnpm, Node LTS, Prettier, `astro check` gates every task                       | —                                                                                          |

## 3. Information architecture — LOCKED

The site is a project tree (nvim-tree style, always expanded — no fold widgets):

```
~/tanjal
├── index.md
├── now.md
├── library.md
├── about.md
├── resume.pdf ↗
└── research/
    ├── hedwig ↗          (symlink → landing page)
    └── paper.pdf ↗       (symlink → the paper)
```

- `/` — **index**: neofetch hero (§8.1) + "recent files" quick-jump list
- `/now` — building/learning/reading right now; the beating heart (§8.2)
- `/library` — the reading log: current, queue, finished (§8.3)
- `/about` — longer bio + the brief research mention (§8.4)
- `resume.pdf` — static PDF in `/public`, opens in new tab (`rel="noopener"`)
- `/404` — `E212: file not found` styled page
- Contact is not a page: email/GitHub/LinkedIn live in the statusline (§6.4)
- Deferred: `writing.md` — the genre's core buffer long-term; add it when the first post exists. Never ship an empty blog.

## 4. Repo layout

```
src/
  components/          # Explorer.astro, Bufferline.astro, Statusline.astro, Neofetch.astro
  components/islands/  # cmdline.ts entry — the one island
  layouts/Buffer.astro # the "editor" frame every page renders inside
  pages/
  styles/global.css    # Rosé Pine tokens (§5), type scale
site.config.ts         # name, tagline, links, email, domain
public/resume.pdf
SPEC.md · NOTES.md · CLAUDE.md
```

## 5. Design tokens — LOCKED (values verified against the official palette)

### 5.1 Rosé Pine main (dark, default)

```css
:root[data-theme='main'] {
  --base: #191724;
  --surface: #1f1d2e;
  --overlay: #26233a;
  --muted: #6e6a86;
  --subtle: #908caa;
  --text: #e0def4;
  --love: #eb6f92;
  --gold: #f6c177;
  --rose: #ebbcba;
  --pine: #31748f;
  --foam: #9ccfd8;
  --iris: #c4a7e7;
  --hl-low: #21202e;
  --hl-med: #403d52;
  --hl-high: #524f67;
}
```

### 5.2 Rosé Pine Dawn (light)

```css
:root[data-theme='dawn'] {
  --base: #faf4ed;
  --surface: #fffaf3;
  --overlay: #f2e9e1;
  --muted: #9893a5;
  --subtle: #797593;
  --text: #575279;
  --love: #b4637a;
  --gold: #ea9d34;
  --rose: #d7827e;
  --pine: #286983;
  --foam: #56949f;
  --iris: #907aa9;
  --hl-low: #f4ede8;
  --hl-med: #dfdad9;
  --hl-high: #cecacd;
}
```

### 5.3 Semantic mapping — what makes it _Rosé Pine_ and not "purple dark mode"

Follow the palette's official roles and the rose-pine/neovim highlight groups:

- `base` page bg · `surface` bufferline/statusline/panel bg · `overlay` floating windows (Telescope modal)
- `text` body · `subtle` secondary text, inactive buffer tabs · `muted` **decorative only** (line numbers, comments — fails AA contrast on `base`; never meaningful small text)
- `iris` links + h1 · `foam` h2, info accents · `rose` h3, inline-code accent · `gold` highlights/strings/warnings · `pine` statusline mode block **background** with `base` text (pine fails AA as small text on base) · `love` errors, destructive, easter eggs only
- `hl-low` cursorline/hover rows · `hl-med` `::selection` background paired with `text` foreground · `hl-high` borders, block cursor

Type: everything monospace (Iosevka). Content column `max-width: 80ch` — the buffer is 80 columns. Body 15–16px, line-height ≥ 1.7 (mono needs air). Headings differ by color + weight, not exotic sizing: h1 iris bold prefixed `# `, h2 foam prefixed `## `, h3 rose — markdown rendered as markdown-in-a-buffer. Prefixes are CSS `::before` content, decorative, excluded from copy.

## 6. The chrome — LOCKED

### 6.1 File explorer (left, primary nav)

`<nav aria-label="explorer">`, nvim-tree-style, rendering the §3 tree. Always expanded — no fold interactivity. Box-drawing characters (`├──`, `└──`, `│`) are decorative `::before` content, `aria-hidden`, unselectable — link text stays clean for screen readers and copy. Current file: `text` on an `hl-low` cursorline row; other entries `subtle`; external symlinks carry `↗`. Desktop ≥1024px: fixed left column (~240px), `surface` bg. Below that: hidden by default, opens as an overlay drawer from the statusline's `≡ files` button (and `Space e`); the drawer must work without the island (`<details>`-based is acceptable if it's keyboard- and screen-reader-clean). Plain anchor links throughout — full navigation works with JS disabled.

### 6.2 Bufferline (top, secondary nav, labelled)

Shows **buffers opened this session**, like a real bufferline. Static default: the current file only. The island (§7) appends files as you visit them (sessionStorage) and renders them as tabs: active `text` on `base` with a `rose` `●`; inactive `subtle` on `surface`. `]b` / `[b` cycle open buffers. Horizontal scroll, no wrapping. This keeps the chrome honest — the explorer shows the project, the bufferline shows your session.

### 6.3 Buffer area

`Buffer.astro` wraps every page: line-number gutter on the left (CSS counters over block-level children), content right. Gutter numbers are `muted`, `aria-hidden="true"`, `user-select: none` — they must never appear in copy-paste or screen-reader output. Gutter hides below ~480px. **Semantics test:** with all CSS removed, every page must read as a plain, sensible document — the chrome is decoration around real HTML, never the substance.

### 6.4 Statusline (bottom, `<footer>`, sticky)

Lualine layout, left → right:
`[ NORMAL ]` mode block (pine bg, base text) · ` main` branch segment (decorative) · `~/tanjal/<buffer>.md` · _(spacer)_ · contact links `gh` `in` `@` · theme toggle (`☀/☾`, equivalent to `:set bg=`) · scroll `%` and `Ln:Col` (decorative; updates via the island, static `Top 0:0` without it).

Mode block is honest: `NORMAL` default → `VISUAL` while text is selected (`selectionchange`) → `COMMAND` while the command-line is focused. This is the micro-delight; no other animation needed.

### 6.4 Command-line row

A `:`-prompt row below the statusline (or overlaid on focus). Click/tap the `:` or press `:` to focus — must be a real `<input>` so mobile keyboards work.

## 7. Keyboard & command layer — the one island — LOCKED behavior

Progressive enhancement: every destination is reachable by plain links; this layer is convenience. JS budget for the whole island: **< 15KB gzipped**.

Keys (active only when focus is NOT in an input/textarea; never bind Ctrl/Cmd combos; never `preventDefault` browser-reserved shortcuts):

- `j` / `k` scroll · `gg` / `G` top/bottom (instant when `prefers-reduced-motion`)
- `]b` / `[b` next/prev buffer
- `:` command-line · `/` or `Space f f` fuzzy finder · `?` help overlay · `Esc` closes any overlay and restores focus to its trigger

Command-line grammar:

- `:e <buffer>` navigate (Tab-completes buffer names) · `:e!` hard reload
- `:help` opens the help overlay (keymap listing)
- `:set bg=light` / `bg=dark` theme (persisted; same no-flash inline-script pattern as the previous project)
- `:set ascii` / `:set noascii` toggles neofetch photo ↔ ASCII art (§8.1), persisted
- `:q` easter egg — statusline flashes `E37: No write since last change` in love; nothing closes. `:q!` → brief "goodbye." toast, scrolls to top. Nothing more.
- Unknown command → `E492: Not an editor command: <input>` in love. All error strings are authentic Vim errors.

Fuzzy finder (Telescope-style): `overlay` bg modal, `> ` prompt, subsequence match with matched characters in gold, entries = buffers + top-level sections + external links (GitHub, LinkedIn, resume, Hedwig landing page, paper). Navigation: arrow keys + Enter (no Ctrl bindings). Focus trapped while open, returned on close; `role="dialog"`, `aria-modal`, labelled.

## 8. Content — real copy drafted below; owner verifies every fact before ship

### 8.1 index — neofetch hero

Layout (stacks on mobile: photo above, info below):

```
┌──────────────┐   tanjal@seattle
│              │   ─────────────────
│   [photo]    │   role      SDE @ Amazon
│              │   edu       BS Computer Science, University of Washington '26
└──────────────┘   focus     distributed systems · database internals · AI infra
                   learning  rust & go — systems project arc
                   research  Hedwig — adaptive governance for LLM coding agents ↗
                   reading   Designing Data-Intensive Applications
                   links     github · linkedin · resume ↗
                   ● ● ● ● ● ●   ← neofetch color strip: love gold rose pine foam iris
```

- Photo: **real and recognizable** — squarish crop, sharp corners, 1px `hl-high` border, framed as if rendered by a terminal image protocol. No heavy filter; at most slight desaturation to sit in the palette (owner decides after seeing both).
- `:set ascii` swaps in a pre-generated ASCII rendering (generated once from the photo via a script, committed as text; regenerate manually if the photo changes).
- Below the fold: "recent files" — 3 quick-jump rows (now.md · library.md · resume.pdf) styled as an oldfiles list.
- The `research` row links out to the Hedwig landing page — this line plus one about.md paragraph is the site's entire research presence.
- **Done when:** hero renders with zero island JS (the toggle enhances it); photo has explicit dimensions (CLS 0); color strip uses the six accent variables; keys `role/edu/…` are real `<dl>` markup.

### 8.2 now.md — the beating heart

/now-page tradition: casual, dated (`last edited: <date>` in `muted` at top), present tense. Sections:

1. **Building** — the current Rust/Go systems project within the six-project arc (OPEN §14: name it); one honest paragraph on where it stands.
2. **Learning** — what the arc is teaching right now; the day job appears here as at most one sentence.
3. **Reading** — currently DDIA (~⅓ through), linking to library.md for the full log.

- **Done when:** a stranger can tell within one screen what he's building and reading _this month_; nothing on the page reads like a resume.

### 8.3 library.md

The reading log — the page that grows. Three plain groups: **reading now** (DDIA, with rough progress), **queue** (Effective Java → A Philosophy of Software Design → Database Internals → Java Concurrency in Practice — owner confirms order), **finished** (title · year finished · optional one-line note in `muted`). No ratings, no cover images, no affiliate links.

- **Done when:** adding a book is a one-line diff to a markdown list.

### 8.4 about.md

3–4 first-person paragraphs: the arc (UW → research → Amazon — the day job in one sentence, not a resume recap), what pulls him toward storage and data systems, where he's headed. One short **research** paragraph: at UW he researched AI–human coding collaboration and built Hedwig, an adaptive governance layer for LLM coding agents — link the landing page and the paper; the award earns at most a clause (owner verifies wording). Deep detail lives at those canonical links, never re-argued here. Optional closing paragraph of non-work texture (owner decides what's public — OPEN §14). Ends with a contact line mirroring the statusline.

## 9. Accessibility — LOCKED (this genre's failure mode; non-negotiable)

- Semantic HTML underneath everything (§6.2 semantics test). Landmarks: `nav` bufferline, `main` buffer, `footer` statusline.
- Gutter numbers and decorative statusline segments: `aria-hidden`, unselectable.
- Keyboard layer: no focus traps outside modals; `Esc` always works; inputs opt out of global keys; overlays are labelled dialogs with managed focus.
- Contrast: body text AA in **both** themes; `muted` and `pine` restricted per §5.3; verify Dawn separately — light themes fail more often.
- Focus visible: 2px `foam` outline, 2px offset, everywhere.
- `prefers-reduced-motion`: instant scrolls, no transitions.
- Touch: every key-driven action has a visible tap path (bufferline links, `:` button, finder button in the statusline).

## 10. Performance & SEO budgets — LOCKED

- Lighthouse ≥ 95 all categories, mobile emulation, on `/` and `/now`.
- Total JS < 25KB gz (island < 15KB); fonts ≤ 120KB; LCP < 1.5s; CLS < 0.05.
- `site` set in M0; unique title/description per buffer; OG image = a designed static "screenshot" of the terminal frame (1200×630, made in M6); sitemap + robots; JSON-LD `Person` on `/`.
- No eager work: beyond `keydown` and `selectionchange` listeners, the island does nothing until interaction.

## 11. Milestones — one agent session each; DoD gates the next

- **M0 — Scaffold.** Astro + Tailwind + Iosevka + Prettier; `site.config.ts`; **real domain in `astro.config.mjs`**; deploy hello. _DoD: live URL; `astro check` + `build` green._
- **M1 — Chrome, static.** Tokens (§5), `Buffer.astro` + gutter, bufferline, statusline (static), both themes with no-flash toggle, 404. _DoD: §6.2 semantics test passes; AA contrast both themes; full nav works keyboard-only via links._
- **M2 — Content.** All four buffers with drafted copy, resume.pdf wired. _DoD: site is shippable with zero island JS; owner receives a checklist of every factual claim to verify._
- **M3 — Island.** Keys, command-line + errors, finder, help overlay, mode indicator, `Ln:Col`. _DoD: §7 grammar complete; JS budget verified from build output; §9 re-verified with overlays present._
- **M4 — Neofetch polish.** ASCII toggle, color strip, photo treatment decision. _DoD: `:set ascii` persists across pages; CLS 0._
- **M5 — Polish.** Hover/cursorline states, Dawn QA pass, edge states, copy pass.
- **M6 — Ship.** OG image, JSON-LD, Lighthouse runs recorded in NOTES.md, custom domain + HTTPS.

## 12. Agent working agreement — LOCKED

Identical to the previous project, plus two additions:

1. Read SPEC.md + NOTES.md first; one milestone per session; DoD gates progression; `pnpm astro check && pnpm build` green ends every task; vanilla before dependencies; no new deps/routes/tokens without asking; small conventional commits.
2. **Facts are sacred:** never invent, round, or embellish any claim about the owner, Hedwig, employers, or metrics. Missing fact → insert `TODO(owner): …` and continue.
3. **Authenticity over invention:** when unsure how a Vim/Neovim element behaves or is spelled (error codes, statusline order, command names), match real Neovim rather than improvising.

## 13. Risks

- **Gimmick decay:** the chrome must never slow a recruiter down — content fully readable with the island ignored. M2's shippable-without-JS gate enforces this.
- **Mobile:** vim keys are moot on touch; the site must feel complete there (§9 tap paths).
- **Employer/IP:** Hedwig links published only at owner-approved level; the day job stays a one-line mention with no internal specifics.

## 14. OPEN — owner inputs

| #   | Item                                                          | Needed by |
| --- | ------------------------------------------------------------- | --------- |
| 1   | Domain (buy early) + final name/tagline wording               | M0        |
| 2   | Headshot (high-res) + plain vs. slightly desaturated          | M2/M4     |
| 3   | Resume PDF (final)                                            | M2        |
| 4   | Hedwig landing page URL + paper URL                           | M2        |
| 5   | Name of the current Rust/Go project for now.md ("building X") | M2        |
| 6   | GitHub/LinkedIn URLs; email to display                        | M1        |
| 7   | about.md: include personal interests? Which?                  | M2        |
| 8   | Default theme: main (dark) confirmed? Dawn only via toggle?   | M1        |
