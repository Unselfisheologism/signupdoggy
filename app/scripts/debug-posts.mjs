import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
const source = readFileSync('src/lib/postContent.ts', 'utf8');
const cleaned = source
  .replace(/Record<string,\s*string>/g, '')
  .replace(/export\s+const\s+POST_BODIES\s*:/g, 'const POST_BODIES');

// Write a Node module wrapper and try to require it
const wrapper = `${cleaned}\nmodule.exports = { POST_BODIES };`;
writeFileSync('/tmp/postContent.js', wrapper);
try {
  execSync('node -e "const m = require(\'/tmp/postContent.js\'); console.log(\'keys:\', Object.keys(m.POST_BODIES));"', { stdio: 'inherit' });
} catch (e) {
  console.log('node failed');
}

// Also try with vm.Script to get the exact parse error
try {
  new vm.Script(wrapper);
  console.log('parse OK');
} catch (e) {
  console.log('parse FAIL:', e.message);
  console.log('stack:', e.stack.split('\n').slice(0, 10).join('\n'));
}