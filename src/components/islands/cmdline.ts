// The one island (SPEC.md §7): keyboard + command-line + fuzzy finder + help
// overlay + live mode/scroll indicators. Vanilla, no dependencies. Budget:
// <15KB gzipped for this file (verify from `pnpm build` output — Astro
// names the chunk after this file).
import { buffers, siteConfig, type Buffer } from '../../../site.config';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

// ---------------------------------------------------------------------------
// Elements (all present in every Buffer.astro page)
// ---------------------------------------------------------------------------

const modeBlock = document.getElementById('mode-block');
const scrollSegment = document.getElementById('scroll-segment');
const lncolSegment = document.getElementById('lncol-segment');

const cmdlineInput = document.getElementById('cmdline-input') as HTMLInputElement | null;
const cmdlineMessage = document.getElementById('cmdline-message');

const themeToggleIcon = document.getElementById('theme-toggle-icon');

const explorerDrawer = document.getElementById('explorer-drawer') as HTMLDetailsElement | null;

const finderOverlay = document.getElementById('finder-overlay');
const finderInput = document.getElementById('finder-input') as HTMLInputElement | null;
const finderList = document.getElementById('finder-list');

const helpOverlay = document.getElementById('help-overlay');

const bufferlineNav = document.querySelector('.bufferline');

// ---------------------------------------------------------------------------
// Mode indicator (NORMAL / VISUAL / COMMAND)
// ---------------------------------------------------------------------------

type Mode = 'NORMAL' | 'VISUAL' | 'COMMAND';

function setMode(mode: Mode) {
  if (!modeBlock) return;
  modeBlock.textContent = `[ ${mode} ]`;
  modeBlock.setAttribute('data-mode', mode);
}

function modeFromSelection(): Mode {
  const sel = document.getSelection();
  return sel && !sel.isCollapsed && sel.toString().length > 0 ? 'VISUAL' : 'NORMAL';
}

document.addEventListener('selectionchange', () => {
  if (document.activeElement === cmdlineInput || document.activeElement === finderInput) return;
  setMode(modeFromSelection());
});

// ---------------------------------------------------------------------------
// Theme + ascii persisted settings
// ---------------------------------------------------------------------------

function setTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  themeToggleIcon?.classList.toggle('is-light', theme === 'light');
}

function setAscii(on: boolean) {
  document.documentElement.setAttribute('data-ascii', on ? 'true' : 'false');
  try {
    localStorage.setItem('ascii', on ? 'true' : 'false');
  } catch {}
}

// ---------------------------------------------------------------------------
// Scroll / Ln:Col (decorative, live via the island)
// ---------------------------------------------------------------------------

let scrollTicking = false;

function updateScrollStatus() {
  scrollTicking = false;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  let pct: string;
  if (scrollable <= 0) pct = 'All';
  else if (window.scrollY <= 0) pct = 'Top';
  else if (window.scrollY >= scrollable - 1) pct = 'Bot';
  else pct = `${Math.round((window.scrollY / scrollable) * 100)}%`;
  if (scrollSegment) scrollSegment.textContent = pct;

  const lines = document.querySelectorAll('#buffer-content .line');
  let ln = 1;
  for (let i = 0; i < lines.length; i++) {
    const rect = lines[i].getBoundingClientRect();
    if (rect.top <= 80) ln = i + 1;
    else break;
  }
  if (lncolSegment) lncolSegment.textContent = `${ln}:1`;
}

function queueScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollStatus);
}

window.addEventListener('scroll', queueScrollUpdate, { passive: true });
window.addEventListener('resize', queueScrollUpdate);
updateScrollStatus();

// ---------------------------------------------------------------------------
// Session buffer list (sessionStorage) — powers the live bufferline + ]b/[b
// ---------------------------------------------------------------------------

const SESSION_KEY = 'openBuffers';

function getSessionBuffers(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return list.filter((p) => buffers.some((b) => b.path === p));
  } catch {
    return [];
  }
}

function saveSessionBuffers(list: string[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(list));
  } catch {}
}

function renderBufferline(list: string[], currentPath: string) {
  if (!bufferlineNav) return;
  bufferlineNav.innerHTML = '';
  for (const path of list) {
    const buf = buffers.find((b) => b.path === path);
    if (!buf) continue;
    const a = document.createElement('a');
    a.href = buf.path;
    a.className = 'buffer-tab' + (path === currentPath ? ' buffer-tab-active' : '');
    if (path === currentPath) a.setAttribute('aria-current', 'page');
    const marker = document.createElement('span');
    marker.className = 'buffer-marker';
    marker.setAttribute('aria-hidden', 'true');
    a.appendChild(marker);
    a.appendChild(document.createTextNode(buf.label));
    bufferlineNav.appendChild(a);
  }
}

function initSessionBuffers() {
  const currentPath = window.location.pathname;
  const known = buffers.some((b) => b.path === currentPath);
  if (!known) return;
  const list = getSessionBuffers();
  if (!list.includes(currentPath)) list.push(currentPath);
  saveSessionBuffers(list);
  renderBufferline(list, currentPath);
}

// SPEC.md §7: "]b/[b cycle open buffers (falls back to all files when only
// one is open)" — a single-buffer session has nothing to cycle to, so fall
// back to the full site buffer list instead of doing nothing.
function cycleBuffer(direction: 1 | -1) {
  const currentPath = window.location.pathname;
  let list = getSessionBuffers();
  if (list.length < 2) list = buffers.map((b) => b.path);
  const idx = list.indexOf(currentPath);
  if (idx === -1) return;
  const next = list[(idx + direction + list.length) % list.length];
  window.location.href = next;
}

initSessionBuffers();

// ---------------------------------------------------------------------------
// Explorer drawer (Space e)
// ---------------------------------------------------------------------------

function toggleExplorerDrawer() {
  if (!explorerDrawer) return;
  explorerDrawer.open = !explorerDrawer.open;
}

// ---------------------------------------------------------------------------
// Command-line (always-visible row — see CommandLine.astro)
// ---------------------------------------------------------------------------

// Only the explicit `:` keybinding tracks a "trigger" to restore focus to
// (captured from document.activeElement *before* focus moves — capturing it
// inside the input's own 'focus' handler would always see the input itself,
// since focus has already landed there by the time that event fires). A
// direct click/Tab into the input has no such trigger to restore, which is
// fine — blur() alone is the expected behavior there.
let lastCmdlineTrigger: HTMLElement | null = null;

function openCmdlineFrom(trigger: HTMLElement | null) {
  if (!cmdlineInput) return;
  cmdlineInput.value = '';
  if (cmdlineMessage) cmdlineMessage.hidden = true;
  cmdlineInput.style.display = '';
  lastCmdlineTrigger = trigger;
  cmdlineInput.focus();
}

function blurCmdline() {
  cmdlineInput?.blur();
  if (lastCmdlineTrigger) {
    lastCmdlineTrigger.focus();
    lastCmdlineTrigger = null;
  }
}

cmdlineInput?.addEventListener('focus', () => {
  if (cmdlineMessage) cmdlineMessage.hidden = true;
  if (cmdlineInput) cmdlineInput.style.display = '';
  setMode('COMMAND');
});

cmdlineInput?.addEventListener('blur', () => {
  setMode(modeFromSelection());
});

function flashCmdlineMessage(text: string) {
  if (!cmdlineInput || !cmdlineMessage) return;
  cmdlineInput.value = '';
  cmdlineInput.style.display = 'none';
  cmdlineMessage.hidden = false;
  cmdlineMessage.textContent = text;
}

function resolveBufferArg(raw: string): Buffer | undefined {
  const needle = raw.replace(/\.md$/i, '').toLowerCase();
  return buffers.find(
    (b) =>
      b.file.toLowerCase() === needle || b.label.toLowerCase().replace(/\.md$/i, '') === needle,
  );
}

function toast(text: string) {
  const el = document.createElement('div');
  el.className = 'nvim-toast';
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 1800);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

function runCommand(raw: string) {
  const cmd = raw.trim();
  if (cmd === '') {
    blurCmdline();
    return;
  }
  if (cmd === 'q') {
    flashCmdlineMessage('E37: No write since last change');
    return;
  }
  if (cmd === 'q!') {
    toast('goodbye.');
    scrollToTop();
    blurCmdline();
    return;
  }
  if (cmd === 'e!') {
    window.location.reload();
    return;
  }
  if (cmd === 'help') {
    blurCmdline();
    openHelp(cmdlineInput);
    return;
  }
  if (cmd === 'set bg=light') {
    setTheme('light');
    blurCmdline();
    return;
  }
  if (cmd === 'set bg=dark') {
    setTheme('dark');
    blurCmdline();
    return;
  }
  if (cmd === 'set ascii') {
    setAscii(true);
    blurCmdline();
    return;
  }
  if (cmd === 'set noascii') {
    setAscii(false);
    blurCmdline();
    return;
  }
  const eMatch = cmd.match(/^e\s+(\S+)$/i);
  if (eMatch) {
    const target = resolveBufferArg(eMatch[1]);
    if (target) {
      window.location.href = target.path;
      return;
    }
    flashCmdlineMessage(`E94: No matching buffer for ${eMatch[1]}`);
    return;
  }
  flashCmdlineMessage(`E492: Not an editor command: ${cmd}`);
}

let tabMatches: Buffer[] = [];
let tabIndex = 0;
let tabFragmentStart = '';

function handleTabCompletion(input: HTMLInputElement) {
  const match = input.value.match(/^(e\s+)(\S*)$/i);
  if (!match) return;
  const [, prefix, fragment] = match;
  if (tabMatches.length === 0 || fragment !== tabFragmentStart) {
    tabFragmentStart = fragment;
    tabMatches = buffers.filter((b) => b.file.toLowerCase().startsWith(fragment.toLowerCase()));
    tabIndex = 0;
  } else {
    tabIndex = (tabIndex + 1) % tabMatches.length;
  }
  if (tabMatches.length > 0) {
    input.value = prefix + tabMatches[tabIndex].file;
  }
}

cmdlineInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    blurCmdline();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    runCommand(cmdlineInput.value);
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    handleTabCompletion(cmdlineInput);
    return;
  }
  tabMatches = [];
});

// ---------------------------------------------------------------------------
// Fuzzy finder
// ---------------------------------------------------------------------------

interface FinderEntry {
  label: string;
  path: string;
  external: boolean;
}

function buildFinderEntries(): FinderEntry[] {
  const entries: FinderEntry[] = buffers.map((b) => ({
    label: b.label,
    path: b.path,
    external: false,
  }));

  entries.push(
    { label: 'now.md · building', path: '/now#building', external: false },
    { label: 'now.md · learning', path: '/now#learning', external: false },
    { label: 'now.md · reading', path: '/now#reading', external: false },
    { label: 'library.md · reading now', path: '/library#reading-now', external: false },
    { label: 'library.md · queue', path: '/library#queue', external: false },
    { label: 'library.md · finished', path: '/library#finished', external: false },
  );

  if (siteConfig.links.github)
    entries.push({ label: 'github', path: siteConfig.links.github, external: true });
  if (siteConfig.links.linkedin)
    entries.push({ label: 'linkedin', path: siteConfig.links.linkedin, external: true });
  if (siteConfig.links.hedwig)
    entries.push({ label: 'Hedwig landing page', path: siteConfig.links.hedwig, external: true });
  if (siteConfig.links.paper)
    entries.push({ label: 'paper', path: siteConfig.links.paper, external: true });

  return entries;
}

const finderEntries = buildFinderEntries();

function fuzzyMatch(
  query: string,
  target: string,
): { matched: boolean; indices: number[]; score: number } {
  if (!query) return { matched: true, indices: [], score: 0 };
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: number[] = [];
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = t.indexOf(q[qi], ti);
    if (idx === -1) return { matched: false, indices: [], score: Infinity };
    indices.push(idx);
    ti = idx + 1;
  }
  const spread = indices[indices.length - 1] - indices[0];
  return { matched: true, indices, score: indices[0] * 2 + spread };
}

function highlightLabel(label: string, indices: number[]): string {
  if (indices.length === 0) return label;
  const idxSet = new Set(indices);
  let out = '';
  for (let i = 0; i < label.length; i++) {
    out += idxSet.has(i) ? `<mark>${label[i]}</mark>` : label[i];
  }
  return out;
}

let finderActiveIndex = 0;
let finderResults: { entry: FinderEntry; indices: number[] }[] = [];
let finderOpen = false;
let finderTrigger: HTMLElement | null = null;

function renderFinderResults() {
  if (!finderList || !finderInput) return;
  finderList.innerHTML = '';
  if (finderResults.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'finder-empty';
    empty.textContent = 'No matches';
    finderList.appendChild(empty);
    finderInput.removeAttribute('aria-activedescendant');
    return;
  }
  finderResults.forEach((r, i) => {
    const li = document.createElement('li');
    li.id = `finder-item-${i}`;
    li.className = 'finder-item';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', i === finderActiveIndex ? 'true' : 'false');
    li.innerHTML = highlightLabel(r.entry.label, r.indices);
    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      navigateFinderEntry(r.entry);
    });
    finderList.appendChild(li);
  });
  finderInput.setAttribute('aria-activedescendant', `finder-item-${finderActiveIndex}`);
}

function updateFinderQuery(query: string) {
  const scored = finderEntries
    .map((entry) => ({ entry, match: fuzzyMatch(query, entry.label) }))
    .filter((r) => r.match.matched)
    .sort((a, b) => a.match.score - b.match.score)
    .map((r) => ({ entry: r.entry, indices: r.match.indices }));
  finderResults = scored;
  finderActiveIndex = 0;
  renderFinderResults();
}

function navigateFinderEntry(entry: FinderEntry) {
  closeFinder();
  if (entry.external) {
    window.open(entry.path, '_blank', 'noopener');
  } else {
    window.location.href = entry.path;
  }
}

function openFinder(trigger: HTMLElement | null) {
  if (!finderOverlay || !finderInput) return;
  finderOverlay.hidden = false;
  finderInput.value = '';
  updateFinderQuery('');
  finderInput.focus();
  finderOpen = true;
  finderTrigger = trigger;
}

function closeFinder() {
  if (!finderOverlay) return;
  finderOverlay.hidden = true;
  finderOpen = false;
  finderTrigger?.focus();
  finderTrigger = null;
}

finderInput?.addEventListener('input', () => updateFinderQuery(finderInput.value));

finderInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeFinder();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (finderResults.length > 0) {
      finderActiveIndex = (finderActiveIndex + 1) % finderResults.length;
      renderFinderResults();
    }
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (finderResults.length > 0) {
      finderActiveIndex = (finderActiveIndex - 1 + finderResults.length) % finderResults.length;
      renderFinderResults();
    }
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const active = finderResults[finderActiveIndex];
    if (active) navigateFinderEntry(active.entry);
  }
});

finderOverlay?.addEventListener('mousedown', (e) => {
  if (e.target === finderOverlay) closeFinder();
});

// ---------------------------------------------------------------------------
// Help overlay
// ---------------------------------------------------------------------------

let helpOpen = false;
let helpTrigger: HTMLElement | null = null;

function openHelp(trigger: HTMLElement | null) {
  if (!helpOverlay) return;
  helpOverlay.hidden = false;
  helpOverlay.focus();
  helpOpen = true;
  helpTrigger = trigger;
}

function closeHelp() {
  if (!helpOverlay) return;
  helpOverlay.hidden = true;
  helpOpen = false;
  helpTrigger?.focus();
  helpTrigger = null;
}

helpOverlay?.addEventListener('mousedown', (e) => {
  if (e.target === helpOverlay) closeHelp();
});

helpOverlay?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeHelp();
  }
});

// ---------------------------------------------------------------------------
// Global key sequences (j, k, gg, G, ]b, [b, Space e, Space f f, :, /, ?, Esc)
// ---------------------------------------------------------------------------

interface KeyEvent {
  key: string;
  t: number;
}

let keyBuffer: KeyEvent[] = [];
const SEQUENCE_WINDOW_MS = 600;

function pushKey(key: string) {
  const now = Date.now();
  keyBuffer = keyBuffer.filter((k) => now - k.t < SEQUENCE_WINDOW_MS);
  keyBuffer.push({ key, t: now });
  if (keyBuffer.length > 3) keyBuffer = keyBuffer.slice(-3);
}

function tail(n: number): string[] {
  return keyBuffer.slice(-n).map((k) => k.key);
}

function scrollByLine(direction: 1 | -1) {
  const lineHeight = parseFloat(getComputedStyle(document.body).lineHeight) || 24;
  window.scrollBy({ top: direction * lineHeight * 3, behavior: scrollBehavior() });
}

document.addEventListener('keydown', (e) => {
  // Escape must always work, even while typing in an input/overlay.
  if (e.key === 'Escape') {
    if (finderOpen) {
      e.preventDefault();
      closeFinder();
      return;
    }
    if (helpOpen) {
      e.preventDefault();
      closeHelp();
      return;
    }
    if (document.activeElement === cmdlineInput) {
      e.preventDefault();
      blurCmdline();
      return;
    }
    return;
  }

  // Inputs opt out of the rest of the global keymap (SPEC.md §9).
  if (isTypingTarget(e.target)) return;
  if (finderOpen || helpOpen) return;

  switch (e.key) {
    case 'j':
      e.preventDefault();
      scrollByLine(1);
      return;
    case 'k':
      e.preventDefault();
      scrollByLine(-1);
      return;
    case 'G':
      e.preventDefault();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: scrollBehavior() });
      return;
    case ':':
      e.preventDefault();
      openCmdlineFrom(document.activeElement as HTMLElement);
      return;
    case '/':
      e.preventDefault();
      openFinder(document.activeElement as HTMLElement);
      return;
    case '?':
      e.preventDefault();
      openHelp(document.activeElement as HTMLElement);
      return;
  }

  if (
    e.key === 'g' ||
    e.key === ']' ||
    e.key === '[' ||
    e.key === 'b' ||
    e.key === ' ' ||
    e.key === 'e' ||
    e.key === 'f'
  ) {
    e.preventDefault();
    pushKey(e.key);
    const t2 = tail(2);
    const t3 = tail(3);
    if (t2[0] === 'g' && t2[1] === 'g') {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      keyBuffer = [];
    } else if (t2[0] === ']' && t2[1] === 'b') {
      cycleBuffer(1);
      keyBuffer = [];
    } else if (t2[0] === '[' && t2[1] === 'b') {
      cycleBuffer(-1);
      keyBuffer = [];
    } else if (t2[0] === ' ' && t2[1] === 'e') {
      toggleExplorerDrawer();
      keyBuffer = [];
    } else if (t3[0] === ' ' && t3[1] === 'f' && t3[2] === 'f') {
      openFinder(document.activeElement as HTMLElement);
      keyBuffer = [];
    }
  }
});
