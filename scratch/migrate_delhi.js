const fs = require('fs');
const path = require('path');

const globalPath = './data/global-directory.json';
const delhiFinalPath = './scratch/delhi_final.json';

try {
    const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));
    const delhiData = JSON.parse(fs.readFileSync(delhiFinalPath, 'utf8'));

    // Filter out any existing Delhi entries (IDs starting with 'del-')
    const nonDelhiData = globalData.filter(item => !item.id.startsWith('del-'));

    // Combine with new verified Delhi data
    const mergedData = [...nonDelhiData, ...delhiData];

    fs.writeFileSync(globalPath, JSON.stringify(mergedData, null, 2));
    console.log(`Successfully integrated ${delhiData.length} verified Delhi entries. Total entries: ${mergedData.length}`);
} catch (e) {
    console.error('Migration failed:', e.message);
}
