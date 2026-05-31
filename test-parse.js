const results = [
  {
    title: 'Dr. Vaibhav Reddy - Chief Medical Officer',
    link: 'https://linkedin.com/in/vaibhavreddy',
    snippet: 'Leading healthtech innovations at XYZ'
  },
  {
    title: 'Ananya Sharma | UX Designer',
    link: 'https://linkedin.com/in/ananya',
    snippet: 'UX Designer'
  },
  {
    title: 'john doe | expert',
    link: 'https://linkedin.com/in/john',
    snippet: 'expert'
  }
];

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

results.map(r => {
    const url = r.link || "";
    const title = r.title || "";
    const name = cleanName(title.split(/[-|:]/)[0]);
    console.log(`Title: "${title}", Extracted Name: "${name}", Length: ${name.length}`);
});
