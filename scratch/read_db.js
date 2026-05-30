const fs = require('fs');

async function dump() {
  try {
    const url = "https://firestore.googleapis.com/v1/projects/easy-club-3b952/databases/(default)/documents/clubs";
    const res = await fetch(url);
    const data = await res.json();
    fs.writeFileSync('/Users/vaibhavreddy/Demo/easy-club-app/scratch/db_clubs.json', JSON.stringify(data, null, 2));
    console.log("Dumped database to scratch/db_clubs.json successfully!");
  } catch (err) {
    console.error("Error dumping database:", err);
  }
}

dump();
