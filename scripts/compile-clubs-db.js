const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'All Cities-Data');
const outputFile = path.join(__dirname, '..', 'data', 'global-clubs-db.json');

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const cityFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('-Clubs.md'));
console.log(`Found ${cityFiles.length} city files to parse...`);

const categoriesMap = {
    'bio': 'Biological Sciences and Biotechnology',
    'biological sciences and biotechnology': 'Biological Sciences and Biotechnology',
    'bio-sciences and life sciences': 'Biological Sciences and Biotechnology',
    'math': 'Mathematics and Quantitative Analysis',
    'mathematics and quantitative reasoning': 'Mathematics and Quantitative Analysis',
    'physics': 'Physics and Theoretical Research',
    'physics and astrophysics': 'Physics and Theoretical Research',
    'chemistry': 'Chemical Sciences and Chemistry',
    'chemistry and chemical engineering': 'Chemical Sciences and Chemistry',
    'racing': 'Racing and Automotive Engineering',
    'racing and automotive engineering': 'Racing and Automotive Engineering',
    'dance': 'Dance and Choreography',
    'dance and choreography': 'Dance and Choreography',
    'singing': 'Singing and Musical Performance',
    'music and singing': 'Singing and Musical Performance',
    'theatre/acting': 'Theatre, Acting, and Dramatics',
    'theatre and acting': 'Theatre, Acting, and Dramatics',
    'astronomy/space': 'Astronomy, Space Science, and Rocketry',
    'astronomy and space science': 'Astronomy, Space Science, and Rocketry',
    'coding': 'Coding, Web Development, and Cybersecurity',
    'coding and software development': 'Coding, Web Development, and Cybersecurity',
    'mountaineering': 'Mountaineering, Trekking, and Adventure Sports',
    'mountaineering and adventure': 'Mountaineering, Trekking, and Adventure Sports',
    'fashion': 'Fashion, Styling, and Modeling',
    'fashion and styling': 'Fashion, Styling, and Modeling',
    'photography': 'Photography, Cinematography, and Visual Media',
    'photography and cinematography': 'Photography, Cinematography, and Visual Media',
    'social service': 'Social Service and Community Outreach',
    'social service and csr': 'Social Service and Community Outreach',
    'debating': 'Debating, Public Speaking, and Rhetoric',
    'debating and public speaking': 'Debating, Public Speaking, and Rhetoric',
    'fine arts': 'Fine Arts, Painting, and Creative Design',
    'fine arts and craft': 'Fine Arts, Painting, and Creative Design',
    'literary': 'Literary Arts and Journalistic Writing',
    'literary and writing': 'Literary Arts and Journalistic Writing',
    'comedy': 'Stand-up, Comedy, and Humorous Writing',
    'comedy and satire': 'Stand-up, Comedy, and Humorous Writing',
    'electronics': 'Electronics and Embedded Systems',
    'electronics and systems engineering': 'Electronics and Embedded Systems',
    'robotics': 'Robotics, Artificial Intelligence, and Automation',
    'robotics and automation': 'Robotics, Artificial Intelligence, and Automation',
    'cultural': 'Cultural Umbrella Bodies and Regional Sanghams',
    'cultural and regional identity': 'Cultural Umbrella Bodies and Regional Sanghams',
    'business': 'Business, Entrepreneurship, and Startups',
    'business and management': 'Business, Entrepreneurship, and Startups'
};

const allClubs = [];
let clubCount = 0;

for (const file of cityFiles) {
    const cityName = file.replace('-Clubs.md', '');
    const filePath = path.join(inputDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let currentCategory = 'General';
    let currentType = 'College'; // default to College

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const lowerLine = line.toLowerCase();

        // 1. Detect Type (College vs Non-College)
        if (
            (line.startsWith('#') || line.startsWith('**')) &&
            (lowerLine.includes('college') || lowerLine.includes('collegiate') || lowerLine.includes('private') || lowerLine.includes('government') || lowerLine.includes('organization') || lowerLine.includes('association') || lowerLine.includes('ngo') || lowerLine.includes('umbrella'))
        ) {
            if (lowerLine.includes('non') || lowerLine.includes('private') || lowerLine.includes('government') || lowerLine.includes('organization') || lowerLine.includes('ngo')) {
                currentType = 'Non-College';
            } else {
                currentType = 'College';
            }
            continue;
        }

        // 2. Detect Category Heading
        // E.g., ## Category: Bio
        // Or **Bio-Sciences and Life Sciences**
        // Or ## Category: Math
        if (line.startsWith('#') || (line.startsWith('**') && line.endsWith('**'))) {
            const catMatch = line.match(/^(?:#+|\*+)?\s*(?:Category:\s*)?(\d+\.\s*)?([A-Za-z0-9\s&\-\/]+)(?:\*+|$)/i) ||
                             line.match(/^##\s+Category:\s*(.+)$/i) ||
                             line.match(/^\*\*([A-Za-z0-9\s&\-\/]+)\*\*$/);
            
            if (catMatch && !line.includes('|')) {
                const rawCat = catMatch[2] ? catMatch[2].trim() : catMatch[1].trim();
                const lowerCat = rawCat.toLowerCase();
                if (categoriesMap[lowerCat]) {
                    currentCategory = categoriesMap[lowerCat];
                } else if (rawCat.length > 2 && rawCat.length < 60) {
                    currentCategory = rawCat; // fallback to raw string
                }
            }
        }

        // 3. Parse Markdown Table Rows
        if (line.startsWith('|') && line.endsWith('|')) {
            // Skip header and separator rows
            if (lowerLine.includes('club name') || lowerLine.includes('club/org name') || line.includes('---') || line.includes(':---')) {
                continue;
            }

            const cells = line.split('|').map(c => c.trim());
            // Since line starts and ends with |, split returns empty strings at index 0 and index length-1
            const parsedCells = cells.slice(1, cells.length - 1);
            if (parsedCells.length >= 2) {
                const name = parsedCells[0];
                if (!name || name === 'Club Name' || name.startsWith('---') || name.startsWith(':')) {
                    continue;
                }

                // Map columns intelligently
                let details = '';
                let achievements = '';
                let memberCount = '';
                let socialMedia = '';
                let website = '';
                let parentOrg = 'Independent';

                if (parsedCells.length === 6) {
                    // Club Name | Details | Achievements | Member Count | Social Media | Official Website
                    details = parsedCells[1];
                    achievements = parsedCells[2];
                    memberCount = parsedCells[3];
                    socialMedia = parsedCells[4];
                    website = parsedCells[5];
                } else if (parsedCells.length === 5) {
                    // Club Name | Details | Achievements | Member Count | Social Media & Website
                    details = parsedCells[1];
                    achievements = parsedCells[2];
                    memberCount = parsedCells[3];
                    socialMedia = parsedCells[4];
                    website = parsedCells[4];
                } else if (parsedCells.length === 4) {
                    // Club Name | Affiliation | Details & Achievements | Social Media / Contact
                    parentOrg = parsedCells[1];
                    details = parsedCells[2];
                    socialMedia = parsedCells[3];
                    website = parsedCells[3];
                } else {
                    // Fallback for other lengths
                    details = parsedCells.slice(1).join(' | ');
                }

                clubCount++;
                const clubId = `${cityName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${String(clubCount).padStart(4, '0')}`;

                allClubs.push({
                    id: clubId,
                    name: name,
                    city: cityName,
                    category: currentCategory,
                    type: currentType,
                    parentOrg: parentOrg,
                    details: details,
                    achievements: achievements,
                    memberCount: memberCount,
                    socialMedia: socialMedia,
                    website: website
                });
            }
        }
    }
}

console.log(`Parsed ${allClubs.length} total clubs across ${cityFiles.length} cities.`);
fs.writeFileSync(outputFile, JSON.stringify(allClubs, null, 2), 'utf-8');
console.log(`Successfully compiled database to ${outputFile}`);
