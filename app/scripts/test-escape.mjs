// Test: does `\u0060` properly escape backtick in a template literal?
const test = `hello\u0060world`;
console.log('value:', JSON.stringify(test));
console.log('length:', test.length);
console.log('first char:', test.charCodeAt(5));  // should be 96 = backtick

// Test: what if a real backtick appears mid-literal?
try {
  const test2 = `hello\u0060world`;
  console.log('test2 ok');
} catch (e) {
  console.log('test2 FAIL:', e.message);
}

// Test the structure from postContent.ts
const obj = {
  'k1':
`body1 line1
body1 line2\u0060,
  'k2':
`body2 line1
body2 line2\u0060,
};
console.log('keys:', Object.keys(obj));
console.log('k1 length:', obj.k1?.length);
console.log('k2 length:', obj.k2?.length);
console.log('k1 sample:', JSON.stringify(obj.k1?.slice(0, 50)));
console.log('k2 sample:', JSON.stringify(obj.k2?.slice(0, 50)));