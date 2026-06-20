// Test 1: \u0060 as escape inside a template literal
const t1 = `hello\u0060world`;
console.log('Test 1 (escape inside literal):');
console.log('  value:', JSON.stringify(t1));
console.log('  length:', t1.length);
console.log('  has backtick:', t1.includes('`'));

// Test 2: What if there's a real backtick in the value
const t2 = `before\`after`;
console.log('Test 2 (real backtick in middle):');
console.log('  value:', JSON.stringify(t2));
console.log('  length:', t2.length);

// Test 3: Template literal followed by comma and another template
const obj = {
  k1: `aaa\u0060,
  k2: `bbb\u0060,
};
console.log('Test 3 (multiple literals):');
console.log('  keys:', Object.keys(obj));
console.log('  k1:', JSON.stringify(obj.k1));
console.log('  k2:', JSON.stringify(obj.k2));