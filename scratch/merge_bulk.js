const fs = require('fs');
const path = require('path');

const scratchDir = './scratch';
const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('delhi_') && f.endsWith('.json') && f !== 'delhi_final.json');

let allClubs = [];
let seenIds = new Set();
let seenNames = new Set();

files.forEach(file => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(scratchDir, file), 'utf8'));
        data.forEach(club => {
            // Create a unique key based on Name + Organization to avoid near-duplicates
            const uniqueKey = `${club.name.toLowerCase().trim()}_${club.organization.toLowerCase().trim()}`;
            if (!seenNames.has(uniqueKey)) {
                allClubs.push(club);
                seenNames.add(uniqueKey);
                seenIds.add(club.id);
            }
        });
    } catch (e) {
        console.error(`Error parsing ${file}:`, e.message);
    }
});

// Re-index IDs to ensure they are sequential and unique
const finalClubs = allClubs.map((club, index) => ({
    ...club,
    id: `del-new-${(index + 1).toString().padStart(3, '0')}`
}));

fs.writeFileSync('./scratch/delhi_bulk.json', JSON.stringify(finalClubs, null, 2));
console.log(`Successfully merged ${finalClubs.length} unique clubs from ${files.length} categories.`);
