// Central site metadata — name, tagline, links, email, domain (SPEC.md §4).
// `null` link values are unresolved OPEN items (SPEC.md §14); components must
// render them as inert/muted rather than emitting a broken href.

export const siteConfig = {
  name: 'tanjal',
  handle: 'tanjal@seattle',
  tagline: 'SDE @ Amazon · distributed systems · database internals · AI infra',
  // TODO(owner): confirm real domain (SPEC.md §14 item 1) — also update astro.config.mjs.
  domain: 'https://tanjal.dev',
  // TODO(owner): email to display publicly (SPEC.md §14 item 6).
  email: null as string | null,
  links: {
    // TODO(owner): GitHub URL (SPEC.md §14 item 6).
    github: null as string | null,
    // TODO(owner): LinkedIn URL (SPEC.md §14 item 6).
    linkedin: null as string | null,
    resume: '/resume.pdf',
    hedwig: 'https://tanjalshukla.github.io/HedwigCLI/' as string | null,
    // TODO(owner): Hedwig paper URL (SPEC.md §14 item 4).
    paper: null as string | null,
  },
  role: 'SDE @ Amazon',
  education: "BS Computer Science, University of Washington '26",
  focus: 'distributed systems · database internals · AI infra',
  // TODO(owner): name the current Rust/Go project (SPEC.md §14 item 5).
  learning: 'rust & go — systems project arc',
  research: 'Hedwig — adaptive governance for LLM coding agents',
  reading: 'Designing Data-Intensive Applications',
} as const;

// Internal pages — real routes/buffers on this site (SPEC.md §3, §8).
export const buffers = [
  { path: '/', label: 'index.md', file: 'index' },
  { path: '/now', label: 'now.md', file: 'now' },
  { path: '/library', label: 'library.md', file: 'library' },
  { path: '/about', label: 'about.md', file: 'about' },
] as const;

export type Buffer = { path: string; label: string; file: string };

// Bufferline/statusline both need "the current buffer" — fall back to a
// synthetic E212 entry for unknown paths (the 404 page) instead of silently
// pretending we're on index.md.
export function resolveBuffer(path: string): Buffer {
  return buffers.find((b) => b.path === path) ?? { path, label: 'E212', file: '404' };
}

// The project tree Explorer.astro renders (SPEC.md §3): internal buffers plus
// external symlinks (resume, Hedwig landing page + paper under research/).
export type TreeNode =
  | { type: 'file'; label: string; path: string }
  | { type: 'symlink'; label: string; path: string | null }
  | { type: 'dir'; label: string; children: TreeNode[] };

export const explorerTree: TreeNode[] = [
  { type: 'file', label: 'index.md', path: '/' },
  { type: 'file', label: 'now.md', path: '/now' },
  { type: 'file', label: 'library.md', path: '/library' },
  { type: 'file', label: 'about.md', path: '/about' },
  { type: 'symlink', label: 'resume.pdf ↗', path: siteConfig.links.resume },
  {
    type: 'dir',
    label: 'research/',
    children: [
      { type: 'symlink', label: 'hedwig ↗', path: siteConfig.links.hedwig },
      { type: 'symlink', label: 'paper.pdf ↗', path: siteConfig.links.paper },
    ],
  },
];
