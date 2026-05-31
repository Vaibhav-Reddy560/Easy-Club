function cleanName(name) {
    if (!name) return "";
    name = name.replace(/[-|:]/g, " ");
    name = name.replace(/\s+/g, " ");
    const match = name.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (match) {
        name = match[0];
    }
    name = name.replace(/\.(edu|com|ac\.in|org|net|in|gov)\b/i, "");
    name = name.trim();
    name = name.replace(/[-|:]+$/, "").trim();
    return name;
}

const titles = [
    "John Doe - Senior Developer",
    "john doe | expert",
    "TEST Definition & Meaning"
];

for (const t of titles) {
    console.log(`Title: ${t} -> Name: ${cleanName(t.split(/[-|:]/)[0])}`);
}
