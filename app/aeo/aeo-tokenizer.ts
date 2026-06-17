/**
 * AEO tokenizer — js-tiktoken integration for the Dualmark AEO Spec.
 *
 * The default word-counter in @dualmark/core is a whitespace split.
 * For accurate BPE counts (what gpt-4o actually sees), we use js-tiktoken
 * with the gpt-4o encoding.
 *
 * The encoder is initialized once at module load. If the import fails
 * (e.g. in a Node test environment without worker support), we throw
 * a clear error — the Worker (U2) wraps this in a try/catch and falls
 * back to @dualmark/core's default word-counter.
 */

import { encodingForModel } from 'js-tiktoken';

// Initialize once at module load. gpt-4o is the most widely-deployed
// model family in 2026; if a future AI consumer complains about token
// counts, swap to 'claude' or 'gemini' encodings here.
const encoder = encodingForModel('gpt-4o');

/**
 * Tokenize a markdown body into a base-10 integer token count.
 * Matches what OpenAI's gpt-4o BPE tokenizer would produce.
 */
export default function tokenize(text: string): number {
  return encoder.encode(text).length;
}
