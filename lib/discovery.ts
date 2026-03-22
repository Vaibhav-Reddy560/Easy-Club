// ─── Direct Discovery Engine (v4.1 - Ultimate Hybrid) ───────────────────
import { callGeminiSafe } from "./gemini";

const COLLEGES = [
    { name: "RV College of Engineering", acronyms: ["RVCE", "RV"] },
    { name: "BMS College of Engineering", acronyms: ["BMSCE", "BMS"] },
    { name: "PES University", acronyms: ["PESU", "PESIT", "PES"] },
    { name: "Ramaiah Institute of Technology", acronyms: ["MSRIT", "RIT"] },
    { name: "Manipal Institute of Technology", acronyms: ["MIT", "Manipal"] },
    { name: "VIT Vellore", acronyms: ["VIT"] },
    { name: "SRM University", acronyms: ["SRM"] },
    { name: "IIT", acronyms: ["Indian Institute of Technology"] },
    { name: "NIT", acronyms: ["National Institute of Technology"] },
    { name: "Christ University", acronyms: ["CU", "Christ"] }
];

interface SerperResult {
    title: string;
    link: string;
    snippet: string;
}

export interface Club {
    name: string;
    college: string;
    description: string;
    location: string;
    website: string;
    social: {
        instagram?: string;
        linkedin?: string;
    };
    imageUrl: string;
}

export interface Event {
    name: string;
    clubName: string;
    college: string;
    description: string;
    date: string;
    location: string;
    website: string;
    imageUrl: string;
    tags: string[];
}

export interface Resource {
    name: string;
    role: string;
    location: string;
    website: string;
    platform: string;
    imageUrl: string;
    tags: string[];
    reason?: string;
}

export async function searchSerper(query: string, serperKey: string, num = 25): Promise<SerperResult[]> {
    try {
        const response = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
            body: JSON.stringify({ q: query, num }),
            signal: AbortSignal.timeout(15000)
        });
        const data = await response.json();
        return data.organic || [];
    } catch { return []; }
}

function cleanName(title: string, college?: string): string {
    let name = title.replace(/\s*[|•·–—:|@]\s*(?:Instagram|LinkedIn|Facebook|Twitter|Official|Photos|Posts|Videos|Home|Website|Events|Clubs).*$/i, "");
    if (college) {
        const escaped = college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        name = name.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "");
        name = name.replace(/\s*[-|:]\s*$/, "");
    }
    name = name.replace(/\.(edu|com|ac\.in|org|net|in|gov)\b/i, "");
    name = name.replace(/\b\d{5,6}\b/g, "");
    name = name.replace(/\b(Rd|Road|Main|Cross|Floor|Nagar|Layout|Colony|Marg)\b.*$/i, "");
    name = name.replace(/\b(Store|Shop|Retail|Showroom|Wholesale)\b.*$/i, "");
    return name.trim();
}

function extractCollege(text: string): string {
    for (const col of COLLEGES) {
        if (new RegExp(`\\b(${col.name}|${col.acronyms.join("|")})\\b`, "i").test(text)) return col.name;
    }
    const genericMatch = text.match(/\b([A-Z][A-Za-z\s]{5,30}(?:University|College|Institute|Academy))\b/i);
    return genericMatch ? genericMatch[0] : "";
}

export function parseSerperResultsToClubs(results: SerperResult[], location: string): Club[] {
    return results.map(r => {
        const college = extractCollege(r.title + " " + r.snippet);
        const name = cleanName(r.title, college);
        const url = r.link || "";
        if (name.length < 3) return null;
        return {
            name,
            college: college || "Academic Campus",
            description: r.snippet,
            location,
            website: url,
            social: url.includes("instagram") ? { instagram: url } : url.includes("linkedin") ? { linkedin: url } : {},
            imageUrl: ""
        };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
}

export function parseSerperResultsToEvents(results: SerperResult[], location: string): Event[] {
    return results.map(r => {
        const fullText = (r.title + " " + r.snippet).toLowerCase();
        let imageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87";
        if (/hack|code|tech/i.test(fullText)) imageUrl = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d";
        else if (/cultural|fest|dance|music/i.test(fullText)) imageUrl = "https://images.unsplash.com/photo-1514525253344-f256bb12efc4";

        return {
            name: cleanName(r.title),
            clubName: "Student Organization",
            college: extractCollege(r.title + " " + r.snippet) || "Campus",
            description: r.snippet,
            date: "Upcoming 2025",
            location,
            website: r.link,
            imageUrl,
            tags: ["Verified"]
        };
    });
}

export function parseSerperResultsToResources(results: SerperResult[], location: string): Resource[] {
    return results.map(r => {
        const url = r.link || "";
        const title = r.title || "";
        const name = cleanName(title.split(/[-|:]/)[0]); // Better name extraction for people
        
        let platform = "web";
        if (url.includes("linkedin.com")) platform = "linkedin";
        else if (url.includes("twitter.com") || url.includes("x.com")) platform = "twitter";
        else if (url.includes("github.com")) platform = "github";

        return {
            name,
            role: title, // Use title as fallback role
            reason: r.snippet, // Use snippet as fallback reason
            location,
            website: url,
            platform,
            imageUrl: `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, "+")}&background=random&color=fff`,
            tags: ["Found"]
        };
    }).filter(p => {
        // Basic filtering to ensure it's a profile, not a generic search page
        const isSearchPage = p.website.includes("/search") || p.website.includes("/explore");
        return !isSearchPage && p.name.length > 2;
    });
}

export interface BaseResource {
    name: string;
    description?: string;
    website: string;
}

export interface VerifiedResource {
    name: string;
    role: string;
    college_affiliation: string;
    reason: string;
    website: string;
}

export async function verifyResourcesWithAI(rawResources: BaseResource[], domain: string, location: string): Promise<Resource[]> {
    if (rawResources.length === 0) return [];

    const candidates = rawResources.slice(0, 15).map(r => ({
        name: r.name,
        snippet: r.description,
        url: r.website
    }));

    const prompt = `You are a Professional Talent Scout. I need to find experts/mentors for a ${domain} club in ${location}.
    Extract only highly relevant individuals (Tech Leads, Directors, Founders, Expert Designers, etc.) from these results.
    
    RULES:
    1. REJECT businesses or job boards.
    2. REJECT students (unless they are founders or exceptional).
    3. ROLE: Extract their actual professional title (e.g., "Senior Software Architect").
    4. HIGHLIGHT: Give a 1-sentence reason why they are a good resource.
    
    INPUT:
    ${JSON.stringify(candidates)}
    
    RETURN ONLY a JSON array: [{ name, role, college_affiliation, reason, website }].`;

    const response = await callGeminiSafe(prompt);
    if (!response) {
        return (rawResources as BaseResource[]).map(r => ({
            name: r.name,
            role: "Resource",
            location,
            website: r.website,
            platform: "web",
            imageUrl: `https://ui-avatars.com/api/?name=${r.name.replace(/\s+/g, "+")}&background=random&color=fff`,
            tags: [domain, "Found"],
            reason: r.description
        }));
    }

    try {
        const start = response.indexOf("[");
        const end = response.lastIndexOf("]") + 1;
        if (start === -1) return [];
        const verified = JSON.parse(response.substring(start, end));

        return verified.map((v: VerifiedResource) => ({
            ...v,
            location,
            imageUrl: `https://ui-avatars.com/api/?name=${v.name.replace(/\s+/g, "+")}&background=random&color=fff`,
            tags: [domain, "Verified"]
        }));
    } catch {
        // Ensure even on parse failure we return something renderable
        return (rawResources as BaseResource[]).map(r => ({
            name: r.name,
            role: "Resource",
            location,
            website: r.website,
            platform: "web",
            imageUrl: `https://ui-avatars.com/api/?name=${r.name.replace(/\s+/g, "+")}&background=random&color=fff`,
            tags: [domain, "Found"],
            reason: r.description
        }));
    }
}
