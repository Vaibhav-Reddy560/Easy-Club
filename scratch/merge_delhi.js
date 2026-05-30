const fs = require('fs');
const path = require('path');

const scratchDir = './scratch';
const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('delhi_') && f.endsWith('.json') && f !== 'delhi_final.json');

let allClubs = [];
let seenIds = new Set();

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(scratchDir, file), 'utf8'));
    data.forEach(club => {
        if (!seenIds.has(club.id)) {
            allClubs.push(club);
            seenIds.add(club.id);
        }
    });
});

fs.writeFileSync('./scratch/delhi_final.json', JSON.stringify(allClubs, null, 2));
console.log(`Merged ${allClubs.length} unique clubs from ${files.length} files into delhi_final.json`);
