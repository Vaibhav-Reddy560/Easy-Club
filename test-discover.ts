import { searchWeb, parseWebResultsToResources, verifyResourcesWithAI } from "./lib/utils/discovery";

async function test() {
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
    console.log("Web Results Length:", allResults.length);
    
    const rawResources = parseWebResultsToResources(allResults, location);
    console.log("Raw Resources:", rawResources);

    const verifiedResources = await verifyResourcesWithAI(rawResources, domain, location);
    console.log("Verified Resources:", verifiedResources);
}

test().catch(console.error);
