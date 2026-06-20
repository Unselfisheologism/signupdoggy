// Minimal test: does \u0060 escape properly inside a template literal?
const test = `hello\u0060world`;
console.log('value:', JSON.stringify(test));
console.log('length:', test.length, '(expected 11 if backtick is in the value)');
console.log('char at 5:', test.charCodeAt(5), '(expected 96 = backtick if escape worked)');
console.log('contains backtick:', test.includes('`'));