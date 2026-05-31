async function searchWeb(query, searchKey, num = 25) {
    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: searchKey, query, max_results: num })
        });
        const data = await response.json();
        if (data.results) {
            return data.results.map((r) => ({
                title: r.title || "",
                link: r.url || "",
                snippet: r.content || ""
            }));
        }
        return [];
    } catch { return []; }
}

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

function parseWebResultsToResources(results, location) {
    return results.map(r => {
        const url = r.link || "";
        const title = r.title || "";
        const name = cleanName(title.split(/[-|:]/)[0]);
        let platform = "web";
        if (url.includes("linkedin.com")) platform = "linkedin";

        return {
            name,
            role: title,
            reason: r.snippet,
            location,
            website: url,
            platform,
            imageUrl: `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, "+")}&background=random&color=fff`,
            tags: ["Found"]
        };
    }).filter(p => {
        const isSearchPage = p.website.includes("/search") || p.website.includes("/explore") || p.website.includes("/dir/");
        return !isSearchPage && p.name.length > 2;
    });
}

async function run() {
    const searchKey = "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";
    const domain = "Fintech";
    const location = "Bengaluru";

    const queries = [
        `site:linkedin.com/in/ "${domain}" ${location}`
    ];

    const resultsArrays = await Promise.all(
        queries.map(q => searchWeb(q, searchKey, 5))
    );
    
    const allResults = resultsArrays.flat();
    console.log("Web Results count:", allResults.length);
    console.log("Raw web results:", allResults);

    const rawResources = parseWebResultsToResources(allResults, location);
    console.log("Filtered Resources count:", rawResources.length);
    console.log("Filtered Resources:", rawResources);
}

run();
