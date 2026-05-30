const fs = require('fs');
const content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

const regex = /<\/?(div|motion\.div)[^>]*>/g;
let match;
const stack = [];

while ((match = regex.exec(content)) !== null) {
  const tag = match[0];
  const isClosing = tag.startsWith('</');
  const isSelfClosing = tag.endsWith('/>');
  
  if (isSelfClosing) continue;
  
  if (isClosing) {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(`Unmatched closing tag at index ${match.index}: ${tag}`);
    }
  } else {
    stack.push({ tag, index: match.index });
  }
}

if (stack.length > 0) {
  console.log("Unmatched opening tags:");
  stack.forEach(s => console.log(`Index ${s.index}: ${s.tag}`));
} else {
  console.log("All div tags are balanced.");
}
