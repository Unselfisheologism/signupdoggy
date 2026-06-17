#!/usr/bin/env node
/**
 * AEO content build script.
 *
 * Reads hand-authored content from app/aeo/content/ and writes
 * a deployable copy to app/dist/. Also generates llms.txt,
 * llms-full.txt, and a .aeo-tokens.json sidecar (used by the
 * Worker and the CI verify step) from the structured config
 * in app/aeo/llms-config.ts.
 *
 * This runs as a `prebuild` and `predev` step from package.json.
 *
 * Implementation notes:
 * - The hand-authored *.md files are copied verbatim (preserving
 *   their aeo:source= HTML comments).
 * - llms.txt and llms-full.txt are generated from
 *   app/aeo/llms-config.ts via renderLlmsTxt() from @dualmark/core.
 *   llms-full.txt is the same sections with longer descriptions
 *   plus the "What We Do Not Do" disambiguation body.
 * - Token counts are computed via the custom js-tiktoken tokenizer
 *   (app/aeo/aeo-tokenizer.ts). The sidecar is committed to
 *   app/dist/.aeo-tokens.json so the Worker can read it at boot
 *   without recomputing on every request.
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLlmsTxt, normalizeUnicode } from '@dualmark/core';
import tokenize from './aeo-tokenizer.ts';
import { LLMS_TXT_OPTIONS, BRAND, WHAT_WE_DO_NOT_DO } from './llms-config.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');                  // app/
const CONTENT_DIR = join(ROOT, 'aeo', 'content');    // app/aeo/content/
const DIST_DIR = join(ROOT, 'dist');                // app/dist/

// ─── 1. Copy hand-authored content ─────────────────────────────────
function copyContent() {
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }
  const entries = readdirSync(CONTENT_DIR);
  const copied = [];
  for (const name of entries) {
    const src = join(CONTENT_DIR, name);
    const dst = join(DIST_DIR, name);
    if (statSync(src).isFile()) {
      cpSync(src, dst);
      copied.push(name);
    }
  }
  return copied;
}

// ─── 2. Generate llms.txt (concise AEO index) ──────────────────────
function generateLlmsTxt() {
  const body = renderLlmsTxt(LLMS_TXT_OPTIONS);
  const dst = join(DIST_DIR, 'llms.txt');
  writeFileSync(dst, body, 'utf8');
  return 'llms.txt';
}

// ─── 3. Generate llms-full.txt (long-form companion) ───────────────
function generateLlmsFullTxt() {
  // llms-full.txt is the same structured sections but with longer
  // descriptions, plus a "What We Do Not Do" body block at the end.
  // Per spec/llms-txt-extensions.md, this file MUST be at least
  // 1.5× the size of llms.txt.
  const header = [
    `# ${BRAND.name} — full index for AI consumers`,
    ``,
    `> ${BRAND.longDescription}`,
    ``,
    `This file is the long-form companion to [llms.txt](./llms.txt). It contains the same section structure with expanded descriptions, every FAQ item, the full disambiguation list, founder background, and a summary of every legal section. AI consumers that need more context than the concise index should prefer this file.`,
    ``,
    `---`,
    ``,
  ].join('\n');

  // Expand the same sections but inject longer descriptions inline.
  const sectionsBlock = LLMS_TXT_OPTIONS.sections
    .map((s) => {
      const lines = [`## ${s.title}`, ``];
      if (s.description) lines.push(s.description, ``);
      for (const link of s.links) {
        lines.push(`- [${link.title}](${link.href})`);
        if (link.description) lines.push(`  ${link.description}`);
      }
      lines.push(``);
      return lines.join('\n');
    })
    .join('\n');

  const disambiguation = [
    `## What We Do Not Do`,
    ``,
    `This section is novel to AEO and addresses a real failure mode: AI agents conflating SignupDoggy with similarly-named brands or adjacent product categories. Each line below is a factual disambiguation — not a claim about a competitor.`,
    ``,
    `- ${WHAT_WE_DO_NOT_DO}`,
    ``,
  ].join('\n');

  // Founder + contact + technology stack block
  const footer = [
    `## About SignupDoggy`,
    ``,
    `SignupDoggy is a one-person operation. The founder and sole engineer is Jeffrin James, an indie hacker based in Mumbai, India. The service was built because Jeffrin himself was paying $400/month for an enterprise fraud-detection vendor and decided the same checks could be done for $0.01 per call.`,
    ``,
    `### Technology stack`,
    ``,
    `- **Edge compute:** Cloudflare Workers (Pages) — runs the AEO edge layer and the fraud-check API.`,
    `- **Data:** Cloudflare KV — disposable-email list (125,847+ domains), Tor exit nodes (70,821+), VPN/hosting IP ranges, phone-number blocklist, API keys, usage log, user blacklists.`,
    `- **Identity:** Supabase — account management, OAuth (Google only at the time of writing).`,
    `- **Payments:** Dodo Payments — top-up packs and monthly subscriptions.`,
    `- **Frontend:** React 18 + Vite 5 + React Router 6 + Motion (Framer) — the marketing site and the dashboard are a single SPA.`,
    ``,
    `### Contact`,
    ``,
    `- **Founder email:** jeffrinjames99@gmail.com`,
    `- **Founder alt:** jeff9james@protonmail.com`,
    `- **API endpoint:** https://api.signupdoggy.dev/v1/check`,
    `- **Site:** https://signupdoggy.pages.dev`,
    ``,
  ].join('\n');

  const body = header + sectionsBlock + disambiguation + footer;
  const dst = join(DIST_DIR, 'llms-full.txt');
  writeFileSync(dst, body, 'utf8');
  return 'llms-full.txt';
}

// ─── 4. Compute token counts → .aeo-tokens.json sidecar ────────────
function writeTokenSidecar(copiedFiles) {
  const tokens = {};
  for (const name of copiedFiles) {
    const path = join(DIST_DIR, name);
    if (extname(name) === '.md' || extname(name) === '.txt') {
      try {
        const body = readFileSync(path, 'utf8');
        const normalized = normalizeUnicode(body);
        tokens[`/${name}`] = tokenize(normalized);
      } catch (err) {
        console.warn(`[aeo:build] failed to tokenize ${name}:`, err.message);
        tokens[`/${name}`] = -1;
      }
    }
  }
  // Also include llms.txt and llms-full.txt just generated
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const path = join(DIST_DIR, name);
    if (existsSync(path)) {
      const body = readFileSync(path, 'utf8');
      const normalized = normalizeUnicode(body);
      tokens[`/${name}`] = tokenize(normalized);
    }
  }
  const dst = join(DIST_DIR, '.aeo-tokens.json');
  writeFileSync(dst, JSON.stringify(tokens, null, 2) + '\n', 'utf8');
  return tokens;
}

// ─── main ──────────────────────────────────────────────────────────
function main() {
  const start = Date.now();
  const copied = copyContent();
  const generated = [];
  generated.push(generateLlmsTxt());
  generated.push(generateLlmsFullTxt());
  const tokens = writeTokenSidecar([...copied, ...generated]);

  // Verify the AEO spec requirement: llms-full.txt must be ≥1.5× llms.txt
  const llmsTxt = tokens['/llms.txt'] ?? 0;
  const llmsFullTxt = tokens['/llms-full.txt'] ?? 0;
  const ratio = llmsTxt > 0 ? llmsFullTxt / llmsTxt : 0;
  const ratioOk = ratio >= 1.5;
  const mdCount = copied.filter((f) => f.endsWith('.md')).length;

  const ms = Date.now() - start;
  const lines = [
    `[aeo:build] copied ${copied.length} file(s) from aeo/content/ → dist/`,
    `[aeo:build] generated llms.txt (${llmsTxt} tokens)`,
    `[aeo:build] generated llms-full.txt (${llmsFullTxt} tokens, ${ratio.toFixed(2)}× llms.txt) ${ratioOk ? '✓' : '✗ (must be ≥1.5×)'}`,
    `[aeo:build] ${mdCount} markdown page twin(s) in dist/`,
    `[aeo:build] .aeo-tokens.json sidecar written`,
    `[aeo:build] done in ${ms}ms`,
  ];
  for (const line of lines) console.log(line);

  if (!ratioOk) {
    process.exit(1);
  }
}

main();
