// Generated from site.config.ts so the sitemap URL tracks the real domain
// instead of a hardcoded placeholder in public/.
import type { APIRoute } from 'astro';
import { siteConfig } from '../../site.config';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', siteConfig.domain).toString()}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
