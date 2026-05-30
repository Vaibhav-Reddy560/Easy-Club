const fs = require('fs');
let content = fs.readFileSync('components/domains/DesignWorkspace.tsx', 'utf8');

// 1. Find the start and end of renderArtboard inside the useEffect
const startToken = '    const renderArtboard = (';
const endToken = '  return () => clearTimeout(timer);';

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find renderArtboard block");
    process.exit(1);
}

// Extract the renderArtboard code
const renderArtboardCode = content.slice(startIndex, endIndex);

// Remove it from its current position
content = content.slice(0, startIndex) + content.slice(endIndex);

// Find the main return statement of the component
// The component is "export default function DesignWorkspace"
// Its return is at the end. We can search for the last "  return ("
const lastReturnIndex = content.lastIndexOf('  return (');

if (lastReturnIndex === -1) {
    console.error("Could not find last return statement");
    process.exit(1);
}

// Insert renderArtboard right before the last return
content = content.slice(0, lastReturnIndex) + renderArtboardCode + '\n' + content.slice(lastReturnIndex);

fs.writeFileSync('components/domains/DesignWorkspace.tsx', content);
console.log("Fixed!");
