// Central site metadata — name, tagline, links, email, domain (SPEC.md §4).
// `null` link values are unresolved OPEN items (SPEC.md §14); components must
// render them as inert/muted rather than emitting a broken href.

export const siteConfig = {
  name: 'tanjal',
  tagline: 'SDE @ Amazon · distributed systems · database internals · AI infra',
  // TODO(owner): confirm real domain (SPEC.md §14 item 1) — also update astro.config.mjs.
  domain: 'https://tanjal.dev',
  // TODO(owner): email to display publicly (SPEC.md §14 item 5).
  email: null as string | null,
  links: {
    // TODO(owner): GitHub URL (SPEC.md §14 item 5).
    github: null as string | null,
    // TODO(owner): LinkedIn URL (SPEC.md §14 item 5).
    linkedin: null as string | null,
    hedwig: 'https://tanjalshukla.github.io/HedwigCLI/' as string | null,
    // TODO(owner): Hedwig paper URL (SPEC.md §14 item 3).
    paper: null as string | null,
  },
  role: 'SDE @ Amazon',
  focus: 'distributed systems · database internals · AI infra',
  // TODO(owner): name the current Rust/Go project (SPEC.md §14 item 4).
  learning: 'rust & go — systems project arc',
  reading: 'Designing Data-Intensive Applications',
} as const;

// The site's whole IA (SPEC.md §3): a flat project tree, no nesting.
// index/now/library/research — no resume.pdf, no about.md (v2 retired both).
export const buffers = [
  { path: '/', label: 'index.md', file: 'index' },
  { path: '/now', label: 'now.md', file: 'now' },
  { path: '/library', label: 'library.md', file: 'library' },
  { path: '/research', label: 'research.md', file: 'research' },
] as const;

export type Buffer = { path: string; label: string; file: string };

// Bufferline/statusline both need "the current buffer" — fall back to a
// synthetic E212 entry for unknown paths (the 404 page) instead of silently
// pretending we're on index.md.
export function resolveBuffer(path: string): Buffer {
  return buffers.find((b) => b.path === path) ?? { path, label: 'E212', file: '404' };
}
