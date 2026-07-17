// Central site metadata — name, tagline, links, email, domain (SPEC.md §4).
// `null` link values are unresolved OPEN items (SPEC.md §14); components must
// render them as inert/muted rather than emitting a broken href.

export const siteConfig = {
  name: 'tanjal',
  tagline: 'SDE @ Amazon',
  // TODO(owner): confirm real domain (SPEC.md §14 item 1) — owner will provide at Vercel deploy time.
  domain: 'https://tanjal.dev',
  email: 'shuklatanjal@gmail.com' as string | null,
  links: {
    github: 'https://github.com/tanjalshukla' as string | null,
    linkedin: 'https://www.linkedin.com/in/tanjals/' as string | null,
    hedwig: 'https://tanjalshukla.github.io/HedwigCLI/' as string | null,
    paper: 'https://arxiv.org/abs/2605.11495' as string | null,
    resume: '/resume.pdf' as string | null,
  },
  role: 'SDE @ Amazon',
  focus: 'distributed systems, AI infra, database internals',
  reading: 'Designing Data-Intensive Applications',
} as const;

export const buffers = [
  { path: '/', label: 'index.md', file: 'index' },
  { path: '/now', label: 'now.md', file: 'now' },
  { path: '/library', label: 'library.md', file: 'library' },
  { path: '/research', label: 'research.md', file: 'research' },
  { path: '/motions', label: 'motions.md', file: 'motions' },
] as const;

export type Buffer = { path: string; label: string; file: string };

// Bufferline/statusline both need "the current buffer" — fall back to a
// synthetic E212 entry for unknown paths (the 404 page) instead of silently
// pretending we're on index.md.
export function resolveBuffer(path: string): Buffer {
  return buffers.find((b) => b.path === path) ?? { path, label: 'E212', file: '404' };
}
