import { parseSerperResultsToClubs, parseSerperResultsToEvents } from './lib/discovery';

const mockSerperData = [
    {
        title: "Sathvik Hegde - Coding Club RVCE",
        snippet: "Sathvik Hegde is a member of the Coding Club at RV College of Engineering, Bengaluru.",
        link: "https://www.linkedin.com/in/sathvik-hegde-123"
    },
    {
        title: "Coding Club RVCE (@codingclubrvce) • Instagram photos",
        snippet: "Follow Coding Club RVCE for updates on events at RVCE Bengaluru.",
        link: "https://www.instagram.com/codingclubrvce/"
    },
    {
        title: "About | Coding Club - RVCE",
        snippet: "Official website of the Coding Club, RVCE. Bengaluru, India.",
        link: "https://codingclub.rvce.edu.in"
    }
];

const location = "Bengaluru";
console.log("--- TESTING CLUBS ---");
const clubs = parseSerperResultsToClubs(mockSerperData, location);
console.log(JSON.stringify(clubs, null, 2));

console.log("\n--- TESTING EVENTS ---");
const events = parseSerperResultsToEvents(mockSerperData, location);
console.log(JSON.stringify(events, null, 2));
