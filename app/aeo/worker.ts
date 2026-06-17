/**
 * signupdoggy-pages — Cloudflare Pages Worker with AEO edge layer.
 *
 * Wraps the static ASSETS binding with @dualmark/cloudflare's
 * createAEOWorker, which provides:
 *   - AI bot detection (User-Agent match against AI_BOTS registry)
 *   - RFC 7231 content negotiation (Accept: text/markdown)
 *   - Markdown twin serving with full AEO headers
 *   - Link rel="alternate" injection on HTML responses
 *   - Internal / external redirect handling
 *   - 406 Not Acceptable when no acceptable representation
 *
 * Routes that should NEVER be negotiated (auth, dashboard, API,
 * static asset extensions) are excluded via skip.prefixes and
 * skip.extensions — see aeo/wrangler.toml for the binding config.
 *
 * The bundled output is dist/_worker.js, produced by
 * aeo/build-worker.mjs. Cloudflare Pages picks that up
 * automatically when assets.run_worker_first = true.
 */

import { createAEOWorker, type MinimalEnv, type MinimalExecutionContext } from '@dualmark/cloudflare';

// Thin upstream: every request goes to the static site bundle.
const upstream = {
  async fetch(
    request: Request,
    env: Env,
    _ctx: MinimalExecutionContext,
  ): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};

// Per-binding env surface. The index signature satisfies
// @dualmark/cloudflare's MinimalEnv constraint (which types
// additional bindings as `unknown`).
interface Env {
  ASSETS: Fetcher;
  // Optional Analytics Engine binding for AEO traffic metrics.
  // If absent, the @dualmark/cloudflare hooks simply no-op.
  AI_AGENT_ANALYTICS?: AnalyticsEngineDataset;
  [binding: string]: unknown;
}

interface AnalyticsEngineDataset {
  writeDataPoint(event: {
    blobs?: ReadonlyArray<string>;
    doubles?: ReadonlyArray<number>;
    indexes?: ReadonlyArray<string>;
  }): void;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

const aeoWorker = createAEOWorker<Env & MinimalEnv>({
  upstream,
  trailingSlash: 'never',
  enableLinkHeader: true,
  skip: {
    prefixes: [
      '/api/',
      '/auth/',
      '/auth',
      '/dashboard',
      '/keys',
      '/checkout',
      '/login',
      '/signup',
      '/api-keys',
      '/_',
    ],
    extensions: [
      '.js',
      '.css',
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.svg',
      '.gif',
      '.ico',
      '.woff',
      '.woff2',
      '.xml',
      '.json',
      '.txt',
      '.pdf',
      '.map',
      '.webmanifest',
      '.mp4',
      '.webm',
      '.wasm',
    ],
  },
  redirects: {
    internal: {},
    external: {},
  },
  analytics: { binding: 'AI_AGENT_ANALYTICS' },
  headers: { cacheControl: 'public, max-age=3600' },
  hooks: {
    onAIRequest: (info) => {
      // Cloudflare Workers console → Workers Logs in the dashboard.
      // Structured for logpush / analytics ingestion.
      console.log(
        JSON.stringify({
          event: 'aeo.ai_request',
          bot: info.botName ?? 'unknown',
          path: info.pathname,
          tokens: info.tokens,
          cache: info.cacheStatus,
        }),
      );
    },
    onMiss: (info) => {
      console.warn(
        JSON.stringify({
          event: 'aeo.miss',
          bot: info.botName ?? 'unknown',
          path: info.pathname,
          accept: info.acceptHeader,
        }),
      );
    },
  },
});

export default aeoWorker;
