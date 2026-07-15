# SPEC — tanjal's personal site (Neovim · One Dark)

> Living spec for AI-augmented development. The agent reads this file at the start of every session.
> **LOCKED** sections are decided — do not relitigate. **OPEN** items need owner input (§14).
> Companion files: `CLAUDE.md` (points here), `NOTES.md` (agent scratchpad + current milestone).

> **v2 revision (Jul 2026)** — supersedes v1; migrate existing code, don't treat the diff as drift:
> theme Rosé Pine → **One Dark**; font Iosevka → **JetBrains Mono**; new **window-frame layout** (§6.0);
> IA is now `index / now / library / research` — resume.pdf and about.md are **removed**, the neofetch
> hero is **retired** (index = photo + about prose). Known v1 build bugs to fix during migration:
> tree glyphs need a space before filenames; stray unspecced icons in the statusline must go;
> gutter numbers should cover every block-level element so they don't float in isolation.

## 1. Concept — LOCKED

The site **is a Neovim session**. Not "terminal-inspired" — a faithful recreation of the chrome: a file-explorer sidebar (the site is a project tree; every page is a file in it), a bufferline showing the buffers you've opened, a content area with a line-number gutter, a lualine-style statusline, and a command-line row. The single signature: **the chrome is functional** — vim keys, a working `:` command-line, a Telescope-style finder.

Spend all boldness there. Everything else is disciplined: real content in semantic HTML, dense and bounded (see §6.0), no gimmicks, fast.

**Audience & the 30-second job:** engineers and recruiters — but the site is built to feel like its owner, not to argue a case. In 30 seconds: who he is (photo + about, right on index), what he's building and reading now, and the research links one click away. The craft of the site is the credential; the content is a living snapshot, not a portfolio.

**Forbidden (anti-cringe guardrails):** CRT scanlines/noise, typing animations on real content, fake boot sequences, blinking-cursor spam, autoplaying anything, "I use arch btw" copy, shipping a Nerd Font webfont, ASCII walls as body text. Humor budget: the chrome itself + exactly two easter eggs (`:q`, `:set ascii`). All prose is earnest and professional.

## 2. Tech stack — LOCKED

| Concern       | Choice                                                                      | Note                                                                                |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Framework     | **Astro** (current major), `output: 'static'`                               | `site` in `astro.config.mjs` is the real domain — never a placeholder               |
| Styling       | **Tailwind v4** via `pnpm astro add tailwind`                               | All colors from CSS variables (§5); no raw hex in components                        |
| Content       | Markdown/MDX pages only                                                     | Small site; nothing to model                                                        |
| Interactivity | **One island**: the keyboard/command layer (§7). Vanilla inside; no UI libs | —                                                                                   |
| Font          | **JetBrains Mono** via Fontsource, latin subset, 400/700 woff2              | Fallback: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. ≤ 120KB total |
| Icons/glyphs  | Plain unicode (`●`, `│`, `├──`, `↗`, `~`) or inline SVG                     | **Never** a Nerd Font                                                               |
| Images        | `astro:assets`                                                              | Headshot: webp/avif, explicit dimensions                                            |
| Hosting       | Vercel or Cloudflare Pages, deploy from `main`                              | —                                                                                   |
| Tooling       | pnpm, Node LTS, Prettier, `astro check` gates every task                    | —                                                                                   |

## 3. Information architecture — LOCKED

The site is a project tree (nvim-tree style, always expanded — no fold widgets):

```
~/tanjal
├── index.md
├── now.md
├── library.md
└── research.md
```

- `/` — **index**: photo + about (§8.1); the whole "who is this" answer on one screen
- `/now` — building/learning/reading right now; the beating heart (§8.2)
- `/library` — the reading log: current, queue, finished (§8.3)
- `/research` — short blurb + Hedwig landing page and paper links (§8.4)
- `/404` — `E212: file not found` styled page
- No resume on the site. Contact is not a page: email/GitHub/LinkedIn live in the statusline (§6.4)

## 4. Repo layout

```
src/
  components/          # Explorer.astro, Bufferline.astro, Statusline.astro
  components/islands/  # cmdline.ts entry — the one island
  layouts/Buffer.astro # the editor frame every page renders inside
  pages/
  styles/global.css    # One Dark tokens (§5), type scale
site.config.ts         # name, tagline, links, email, domain
SPEC.md · NOTES.md · CLAUDE.md
```

## 5. Design tokens — LOCKED (values from navarasu/onedark.nvim, `dark` style)

### 5.1 One Dark (default)

```css
:root[data-theme='dark'] {
  --bg0: #282c34; /* buffer background */
  --bg1: #31353f; /* cursorline, hover rows */
  --bg2: #393f4a; /* raised panels, tab hover */
  --bg3: #3b3f4c; /* selection, borders, winseparator */
  --bg-d: #21252b; /* chrome: explorer, statusline, desktop */
  --fg: #abb2bf; /* body text */
  --grey: #5c6370; /* comments, gutter — DECORATIVE ONLY (fails AA on bg0) */
  --light-grey: #848b98; /* secondary text, inactive entries */
  --red: #e86671;
  --green: #98c379;
  --yellow: #e5c07b;
  --orange: #d19a66;
  --blue: #61afef;
  --purple: #c678dd;
  --cyan: #56b6c2;
}
```

### 5.2 Light theme

One Light, sourced by the agent from the same repo's `palette.lua` (`light` style) at implementation time — do not invent values. Same variable names.

### 5.3 Semantic mapping — deploy the palette like a highlighted buffer, not a wireframe

The v1 build failed by rendering nearly everything in greys. Rule: **every screen must visibly use at least three accents**, assigned as One Dark uses them:

- `bg0` buffer · `bg-d` chrome panes + desktop behind the window · `bg1` cursorline/hover · `bg3` `::selection` (with `fg`), borders, winseparators
- `fg` body · `light-grey` secondary/inactive · `grey` strictly decorative (gutter numbers, `#` heading prefixes, comment-style asides)
- `blue` — all links (underlined) and "function"-flavored accents
- `red` — headings (bold), per One Dark's markdown convention; also errors/easter eggs
- `green` — the statusline NORMAL block (lualine onedark convention), string-flavored accents (the tagline in quotes), git-add-flavored positives
- `purple` — VISUAL mode block, keyword-flavored labels (e.g., `last edited:`, list-group titles)
- `yellow` — COMMAND mode block, highlights, in-progress markers
- `orange` — numbers, dates, progress figures
- `cyan` — tags, metadata, tree folder accents

Statusline mode blocks: match lualine's `onedark` theme — `NORMAL` green, `VISUAL` purple, `COMMAND` yellow, each with `bg0` text (agent verifies against the lualine theme source).

Type: everything JetBrains Mono. Content column `max-width: 80ch`; body 15–16px, line-height ≥ 1.7. Headings differ by color + weight, not exotic sizes: h1/h2 red bold prefixed `# `/`## ` (prefixes in `grey`, decorative `::before`, excluded from copy), h3 orange.

## 6. The chrome — LOCKED

### 6.0 The window frame — the v2 layout fix

The editor is a **bounded window on a desktop**, not a full-bleed page. Page background: `bg-d` (or 6% darker). The editor window: centered, `max-width: 1080px`, `min-height: 88vh`, `bg0`, 1px `bg3` border, 4px radius, subtle shadow. All chrome (bufferline, explorer, buffer, statusline, cmdline) lives inside it. Density rules: content starts ≤ 2 line-heights under the bufferline; no region of the window may be more than ~35% empty at desktop width with real content; explorer entries at comfortable but tight line-height (~1.9). Below ~768px the window goes edge-to-edge (no desktop margin).

### 6.1 File explorer (left pane, primary nav)

`<nav aria-label="explorer">`, nvim-tree-style, rendering the §3 tree, always expanded. Box-drawing glyphs (`├──`, `└──`, `│`) are decorative `::before` content, `aria-hidden`, unselectable, **with a space before filenames**. Pane: `bg-d`, ~220px, 1px `bg3` winseparator on its right. Current file: `fg` on `bg1` cursorline row; others `light-grey`; hover `bg1`. Root `~/tanjal` in `cyan`. Below desktop: hidden by default, opens as an overlay drawer from the statusline's `≡ files` button (and `Space e`); drawer must work without the island (`<details>`-based acceptable if keyboard- and screen-reader-clean). Plain anchor links — full navigation works with JS disabled.

### 6.2 Bufferline (top, secondary nav, labelled)

Shows **buffers opened this session**, like a real bufferline. Static default: current file only. The island (§7) appends visited files (sessionStorage): active tab `fg` on `bg0` with a `green` `●`; inactive `light-grey` on `bg-d`. `]b`/`[b` cycle open buffers. Horizontal scroll, no wrap.

### 6.3 Buffer area

`Buffer.astro`: line-number gutter left (CSS counters), content right, sits beside the explorer. Gutter numbers `grey`, `aria-hidden`, `user-select: none`, and cover **every block-level element** (paragraphs, headings, list items) so numbering reads continuous rather than floating. Gutter hides below ~480px. **Semantics test:** with CSS removed, every page reads as a plain, sensible document.

### 6.4 Statusline (bottom of window, `<footer>`, sticky within it)

Lualine layout, left → right: mode block (§5.3 colors) · ` main` (decorative) · `~/tanjal/<file>` · _(spacer)_ · contact links `gh` `in` `@` · theme toggle (`☀/☾`, equivalent to `:set bg=`) · `≡ files` (below desktop) · scroll `%` + `Ln:Col` (island-updated; static `Top 0:0` without it). Nothing else — remove any unspecced icons. Mode is honest: `NORMAL` default, `VISUAL` on text selection, `COMMAND` while the command-line has focus.

### 6.5 Command-line row

A `:`-prompt row at the window's bottom edge. Click/tap `:` or press `:` to focus — a real `<input>` so mobile keyboards work.

## 7. Keyboard & command layer — the one island — LOCKED behavior

Progressive enhancement; every destination reachable by plain links. Island budget: **< 15KB gzipped**.

Keys (inactive when focus is in an input; never bind Ctrl/Cmd combos):

- `j`/`k` scroll · `gg`/`G` top/bottom (instant under `prefers-reduced-motion`)
- `]b`/`[b` cycle open buffers (falls back to all files when only one is open)
- `Space e` toggle the explorer (drawer below desktop)
- `:` command-line · `/` or `Space f f` fuzzy finder · `?` help overlay · `Esc` closes any overlay, restores focus

Command grammar:

- `:e <file>` navigate (Tab-completes) · `:e!` hard reload
- `:help` keymap overlay
- `:set bg=light|dark` theme (persisted, no-flash inline script)
- `:set ascii` / `:set noascii` — index photo ↔ pre-generated ASCII art, persisted
- `:q` → statusline flashes `E37: No write since last change` in red; `:q!` → brief "goodbye." toast, scroll to top
- Unknown → `E492: Not an editor command: <input>` in red. All error strings are authentic Vim errors.

Fuzzy finder (Telescope-style): `bg-d` modal over the window, `> ` prompt, subsequence match with matched chars in `yellow`; entries = files + top-level sections + external links (GitHub, LinkedIn, Hedwig landing page, paper). Arrows + Enter. Focus trapped while open, returned on close; labelled `role="dialog"` + `aria-modal`.

## 8. Content — drafted; owner verifies every fact before ship

### 8.1 index.md — photo + about, the whole answer on one screen

mitchellh.com is the register: short, dense, first-person paragraphs with inline links; no section scaffolding.

- Top: photo (real, recognizable; squarish, sharp corners, 1px `bg3` border — rendered like a terminal image protocol) beside name (h1, red) and a one-line tagline in `green` string-quotes styling. Stacks on mobile.
- Then 3–4 short paragraphs: what he does now (SDE @ Amazon — one sentence), what he's into (distributed systems, database internals, AI infra) and what he's building toward, one line on the UW → research → industry arc with "research" linked inline to `/research`, and optionally one line of non-work texture (OPEN §14).
- Footer flourish: the six-accent color strip `● ● ● ● ● ●` (red green yellow blue purple cyan) — the one decoration.
- **Done when:** a stranger knows who he is without scrolling on desktop; photo has explicit dimensions (CLS 0); ≥3 accents visibly used; `:set ascii` still swaps the photo.

### 8.2 now.md — the beating heart

/now-page tradition: casual, dated (`last edited: <date>` — label `purple`, date `orange`). Sections: **Building** (the current Rust/Go systems project — OPEN §14 — one honest paragraph), **Learning** (what the arc is teaching; day job ≤ one sentence), **Reading** (DDIA, ~⅓ through, linking library.md).

- **Done when:** one screen tells a stranger what he's building and reading _this month_; nothing reads like a resume.

### 8.3 library.md — kept as-is from v1 (owner likes it)

Three plain groups: **reading now** (DDIA + rough progress in `orange`), **queue** (Effective Java → A Philosophy of Software Design → Database Internals → Java Concurrency in Practice — owner confirms order), **finished** (title · year · optional one-line note in `grey` comment styling). No ratings, no covers, no affiliate links.

- **Done when:** adding a book is a one-line diff.

### 8.4 research.md — short by design

One short blurb (2–3 sentences, owner verifies wording): at UW he researched AI–human coding collaboration and built **Hedwig**, an adaptive governance layer for LLM coding agents; the award earns at most a clause. Then two prominent links: **Hedwig landing page ↗** and **paper ↗** (`blue`, underlined). Nothing else — deep detail lives at the canonical links.

- **Done when:** the page fits in one screen and both links work.

## 9. Accessibility — LOCKED

- Semantic HTML underneath everything (§6.3 semantics test). Landmarks: labelled `nav` explorer (primary) and `nav` bufferline (secondary), `main` buffer, `footer` statusline.
- Gutter numbers, tree glyphs, decorative statusline segments: `aria-hidden`, unselectable.
- Keyboard layer: no focus traps outside modals; `Esc` always works; overlays are labelled dialogs with managed focus.
- Contrast: body AA in both themes; `grey` strictly decorative; verify accent-on-`bg0` combinations, and One Light separately — light themes fail more often.
- Focus visible: 2px `blue` outline, 2px offset, everywhere.
- `prefers-reduced-motion`: instant scrolls, no transitions.
- Touch: every key-driven action has a visible tap path (explorer links, `≡ files`, `:` button, finder button).

## 10. Performance & SEO budgets — LOCKED

- Lighthouse ≥ 95 all categories, mobile emulation, `/` and `/now`.
- Total JS < 25KB gz (island < 15KB); fonts ≤ 120KB; LCP < 1.5s; CLS < 0.05.
- Unique title/description per page; OG image = designed static "screenshot" of the window (1200×630, M6); sitemap + robots; JSON-LD `Person` on `/`.

## 11. Milestones — one agent session each; DoD gates the next

- **M1v2 — Migration.** Apply §5 tokens + JetBrains Mono, build the §6.0 window frame, fix v1 bugs (revision note), restyle explorer/bufferline/statusline per §6. _DoD: both themes AA; §6.3 semantics test; every screen shows ≥3 accents; v1 bug list closed._
- **M2 — Content.** Four pages per §8, old about/resume/neofetch code deleted. _DoD: shippable with zero island JS; owner gets a checklist of every factual claim._
- **M3 — Island.** Keys, command-line + errors, finder, help overlay, mode indicator, session bufferline, `Ln:Col`. _DoD: §7 complete; JS budget verified; §9 re-verified with overlays._
- **M4 — Photo polish.** ASCII toggle, photo treatment decision, color strip.
- **M5 — Polish.** Hover/cursorline states, One Light QA, edge states, copy pass.
- **M6 — Ship.** OG image, JSON-LD, Lighthouse runs in NOTES.md, custom domain + HTTPS.

## 12. Agent working agreement — LOCKED

1. Read SPEC.md + NOTES.md first; one milestone per session; DoD gates progression; `pnpm astro check && pnpm build` green ends every task; vanilla before dependencies; no new deps/routes/tokens without asking; small conventional commits.
2. **Facts are sacred:** never invent, round, or embellish any claim about the owner, Hedwig, employers, or metrics. Missing fact → `TODO(owner): …` and continue.
3. **Authenticity over invention:** when unsure how a Vim/Neovim/One Dark element behaves or is spelled, match the real thing (onedark.nvim, lualine, Vim error codes) rather than improvising.

## 13. Risks

- **Gimmick decay:** content fully readable with the island ignored; M2's zero-JS gate enforces it.
- **Washed-out regression:** the ≥3-accents rule (§5.3) and M1v2 DoD exist because v1 failed here.
- **Employer/IP:** Hedwig links at owner-approved level; day job stays one sentence, no internal specifics.

## 14. OPEN — owner inputs

| #   | Item                                                     | Needed by |
| --- | -------------------------------------------------------- | --------- |
| 1   | Domain (buy early) + final name/tagline wording          | M1v2      |
| 2   | Headshot (high-res) — replaces the `photo pending` box   | M2        |
| 3   | Hedwig landing page URL + paper URL                      | M2        |
| 4   | Name of the current Rust/Go project ("building X")       | M2        |
| 5   | GitHub/LinkedIn URLs; email to display                   | M2        |
| 6   | index.md bio: owner voice pass on the drafted paragraphs | M2        |
| 7   | Personal-texture line on index: include? What?           | M2        |
| 8   | Dark default confirmed; One Light only via toggle?       | M1v2      |
