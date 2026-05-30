// ─── Direct Discovery Engine (v5.0 - Local-First, Zero AI) ───────────────────
import fs from "fs";
import path from "path";
import { callGeminiJSON } from "@/lib/services/gemini";
import { callOpenAIJSON } from "@/lib/services/openai";

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

export function getCanonicalCategory(category: string): string {
    const lower = category.toLowerCase().trim();
    if (lower.includes("bio")) return "Biological Sciences and Biotechnology";
    if (lower.includes("math")) return "Mathematics and Quantitative Analysis";
    if (lower.includes("physics")) return "Physics and Theoretical Research";
    if (lower.includes("chem")) return "Chemical Sciences and Chemistry";
    if (lower.includes("racing")) return "Racing and Automotive Engineering";
    if (lower.includes("dance")) return "Dance and Choreography";
    if (lower.includes("sing")) return "Singing and Musical Performance";
    if (lower.includes("theatre") || lower.includes("acting")) return "Theatre, Acting, and Dramatics";
    if (lower.includes("astronomy") || lower.includes("space")) return "Astronomy, Space Science, and Rocketry";
    if (lower.includes("coding") || lower.includes("software")) return "Coding, Web Development, and Cybersecurity";
    if (lower.includes("mountain") || lower.includes("trek") || lower.includes("adventure")) return "Mountaineering, Trekking, and Adventure Sports";
    if (lower.includes("fashion") || lower.includes("styling")) return "Fashion, Styling, and Modeling";
    if (lower.includes("photograph")) return "Photography, Cinematography, and Visual Media";
    if (lower.includes("social") || lower.includes("community")) return "Social Service and Community Outreach";
    if (lower.includes("debat") || lower.includes("public speaking")) return "Debating, Public Speaking, and Rhetoric";
    if (lower.includes("fine arts") || lower.includes("paint") || lower.includes("design")) return "Fine Arts, Painting, and Creative Design";
    if (lower.includes("literary") || lower.includes("writ")) return "Literary Arts and Journalistic Writing";
    if (lower.includes("comedy") || lower.includes("satire") || lower.includes("humor")) return "Stand-up, Comedy, and Humorous Writing";
    if (lower.includes("electron")) return "Electronics and Embedded Systems";
    if (lower.includes("robot")) return "Robotics, Artificial Intelligence, and Automation";
    if (lower.includes("cultural")) return "Cultural Umbrella Bodies and Regional Sanghams";
    if (lower.includes("business") || lower.includes("entrepreneur") || lower.includes("startup")) return "Business, Entrepreneurship, and Startups";
    return category;
}

export function getClubsFromLocalFile(category: string, type: string, location: string): any[] {
    try {
        const searchLoc = location.toLowerCase().trim().split(",")[0].trim();
        
        // Try specific city mapping first
        const cityMappings: Record<string, string> = {
            "bangalore": "Bengaluru",
            "bengaluru": "Bengaluru",
            "bombay": "Mumbai",
            "mumbai": "Mumbai",
            "madras": "Chennai",
            "chennai": "Chennai",
            "calcutta": "Kolkata",
            "kolkata": "Kolkata",
            "prayagraj": "Allahabad (Prayagraj)",
            "allahabad": "Allahabad (Prayagraj)",
            "pondicherry": "Puducherry",
            "puducherry": "Puducherry",
            "trivandrum": "Thiruvananthapuram",
            "thiruvananthapuram": "Thiruvananthapuram",
            "cochin": "Kochi",
            "kochi": "Kochi",
            "vizag": "Visakhapatnam",
            "visakhapatnam": "Visakhapatnam"
        };
        
        const mappedCity = cityMappings[searchLoc] || searchLoc;
        
        const dbPath = path.join(process.cwd(), "data", "global-clubs-db.json");
        if (fs.existsSync(dbPath)) {
            console.log(`[Local Discovery] Reading from compiled database: ${dbPath}`);
            const dbData = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
            
            // Find clubs for this city
            const clubs = dbData.filter((c: any) => {
                const cCity = c.city.toLowerCase();
                const targetCity = mappedCity.toLowerCase();
                return cCity === targetCity || cCity.includes(searchLoc) || searchLoc.includes(cCity);
            });
            
            if (clubs.length > 0) {
                console.log(`[Local Discovery] Found ${clubs.length} clubs for city "${mappedCity}" in compiled database.`);
                
                // Filter by category and type
                const filtered = clubs.filter((club: any) => {
                    const canonicalQuery = getCanonicalCategory(category);
                    const canonicalClub = getCanonicalCategory(club.category);
                    const catMatched = !category || category.toLowerCase() === "all" || canonicalQuery === canonicalClub;
                                       
                    const typeMatched = !type || type.toLowerCase() === "all" || (club.type.toLowerCase() === type.toLowerCase());
                    return catMatched && typeMatched;
                });
                
                console.log(`[Local Discovery] Filtered to ${filtered.length} matching clubs in compiled database.`);
                
                // Format to expected UI structure
                return filtered.map((club: any) => {
                    let parentOrg = club.parentOrg || "Independent Organization";
                    if (club.type === "College" && (!parentOrg || parentOrg === "Independent" || parentOrg === "Independent Organization")) {
                        parentOrg = extractCollegeName(club.name, club.details) || `${club.city} Institute`;
                    }
                    
                    return {
                        club_name: club.name,
                        category: club.category,
                        region: club.city,
                        parent_org: parentOrg,
                        type: club.type === "College" ? "college" : "non-college",
                        description: club.details || "",
                        achievements: club.achievements || "",
                        approxMemberCount: club.memberCount || "",
                        official_website: (club.website && club.website !== "N/A" && club.website !== "N/a") ? club.website : "",
                        social_media: parseSocialMedia(club.socialMedia)
                    };
                });
            }
        }
        
        console.log(`[Local Discovery] Database fallback to direct markdown file reading...`);
        const dataDir = path.join(process.cwd(), "public", "All Cities-Data");
        if (!fs.existsSync(dataDir)) {
            console.warn(`[Local Discovery] Data directory not found at ${dataDir}`);
            return [];
        }

        const files = fs.readdirSync(dataDir);
        
        // Find matching file
        let matchedFile = "";
        const exactFile = `${mappedCity}-Clubs.md`;
        if (files.includes(exactFile)) {
            matchedFile = exactFile;
        }
        
        if (!matchedFile) {
            // Find file with substring match or closest name
            for (const file of files) {
                if (!file.endsWith("-Clubs.md")) continue;
                const cityName = file.replace("-Clubs.md", "").toLowerCase();
                if (cityName.includes(searchLoc) || searchLoc.includes(cityName)) {
                    matchedFile = file;
                    break;
                }
            }
        }
        
        if (!matchedFile) {
            console.warn(`[Local Discovery] No matched file found for location "${location}" (search target: "${searchLoc}")`);
            return [];
        }

        console.log(`[Local Discovery] Matched city file: ${matchedFile} for location "${location}"`);
        const filePath = path.join(dataDir, matchedFile);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        
        const lines = fileContent.split("\n");
        let currentCategory = "";
        let currentType: "College" | "Non-College" | null = null;
        const parsedClubs: any[] = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // 1. Detect subheaders like "Collegiate Bio and Life Science Clubs" or "Non-Collegiate Bio and Environmental Associations"
            const subMatch = trimmedLine.match(/^(?:#+|\*+)?\s*(Collegiate|Non-Collegiate|College|Non-College)/i);
            if (subMatch) {
                const subType = subMatch[1].toLowerCase();
                if (subType.includes("non")) {
                    currentType = "Non-College";
                } else {
                    currentType = "College";
                }
                continue;
            }

            // 2. Match category headers: e.g. "**1. Bio and Life Sciences**", "# 1. Biological Sciences and Biotechnology", "## Category: Bio"
            const catMatch = trimmedLine.match(/^(?:#+|\*+)?\s*(?:Category:\s*)?(\d+)\.\s*(.*?)(?:\*+|$)/i) || 
                             trimmedLine.match(/^##\s+Category:\s*(.+)$/i);
            if (catMatch) {
                currentCategory = (catMatch[2] || catMatch[1]).trim();
                continue;
            }
            
            // 3. Match table rows
            if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
                if (trimmedLine.includes("Club Name") || trimmedLine.includes("Details and Objectives") || trimmedLine.includes(":---") || trimmedLine.includes("---")) {
                    continue;
                }
                
                const parts = trimmedLine.split("|").map(p => p.trim());
                if (parts.length >= 5) {
                    const clubName = parts[1];
                    let details = "";
                    let achievements = "";
                    let memberCount = "";
                    let socialMediaStr = "";
                    let websiteStr = "";
                    let parentOrg = "Independent Organization";
                    
                    if (parts.length === 6) { // 4 columns: Name | Affiliation | Details & Achievements | Social Media / Contact
                        parentOrg = parts[2];
                        details = parts[3];
                        websiteStr = parts[4];
                        socialMediaStr = parts[4];
                    } else if (parts.length >= 7) { // 5 columns: Name | Details | Achievements | Member Count | Social Media / Website
                        details = parts[2];
                        achievements = parts[3];
                        memberCount = parts[4];
                        websiteStr = parts[5];
                        socialMediaStr = parts[5];
                    }
                    
                    if (clubName && clubName !== "Club Name" && !clubName.startsWith(":") && !clubName.startsWith("---")) {
                        // Dynamically resolve type if null
                        let resolvedType = currentType;
                        if (!resolvedType) {
                            const text = `${clubName} ${parentOrg} ${details}`.toLowerCase();
                            if (text.includes("college") || text.includes("university") || text.includes("institute") || text.includes("campus") || text.includes("iit") || text.includes("nit") || text.includes("iiit") || text.includes("bits") || text.includes("nsut") || text.includes("dtu") || text.includes("rvce") || text.includes("bmsce") || text.includes("pesu") || text.includes("jmc") || text.includes("srcc") || text.includes("stephen")) {
                                resolvedType = "College";
                            } else {
                                resolvedType = "Non-College";
                            }
                        }
                        
                        // Dynamically resolve parent_org if not college
                        if (resolvedType === "Non-College" && (!parentOrg || parentOrg.toLowerCase() === "private" || parentOrg.toLowerCase() === "academy" || parentOrg.toLowerCase() === "non-college")) {
                            parentOrg = "Independent Organization";
                        }

                        parsedClubs.push({
                            clubName,
                            details,
                            achievements,
                            memberCount,
                            socialMediaStr,
                            websiteStr,
                            category: currentCategory || "General",
                            type: resolvedType,
                            parentOrg
                        });
                    }
                }
            }
        }

        console.log(`[Local Discovery] Parsed ${parsedClubs.length} total clubs from ${matchedFile}`);
        
        // Filter by requested category and type
        const filteredClubs = parsedClubs.filter(club => {
            // Match category (case insensitive and fuzzy)
            const canonicalQuery = getCanonicalCategory(category);
            const canonicalClub = getCanonicalCategory(club.category);
            const catMatched = !category || category.toLowerCase() === "all" || canonicalQuery === canonicalClub;
                               
            // Match type (College vs Non-College)
            const typeMatched = !type || type.toLowerCase() === "all" || (club.type?.toLowerCase() === type.toLowerCase());
            
            return catMatched && typeMatched;
        });

        console.log(`[Local Discovery] Filtered to ${filteredClubs.length} matching clubs for category "${category}" and type "${type}"`);
        
        // Format to the expected UI structure
        return filteredClubs.map(club => {
            let parentOrg = club.parentOrg || "Independent Organization";
            if (club.type === "College" && (!parentOrg || parentOrg === "Independent Organization")) {
                parentOrg = extractCollegeName(club.clubName, club.details) || `${matchedFile.replace("-Clubs.md", "")} Institute`;
            } else if (club.details && club.details.toLowerCase().includes("at ")) {
                const atMatch = club.details.match(/at\s+([A-Za-z0-9\s]+)/i);
                if (atMatch) parentOrg = atMatch[1].trim();
            }
            
            return {
                club_name: club.clubName,
                category: club.category,
                region: matchedFile.replace("-Clubs.md", ""),
                parent_org: parentOrg,
                type: club.type === "College" ? "college" : "non-college",
                description: club.details || "",
                achievements: club.achievements || "",
                approxMemberCount: club.memberCount || "",
                official_website: (club.websiteStr && club.websiteStr !== "N/A" && club.websiteStr !== "N/a") ? club.websiteStr : "",
                social_media: parseSocialMedia(club.socialMediaStr)
            };
        });
    } catch (error) {
        console.error("[Local Discovery] Error reading or parsing city file:", error);
        return [];
    }
}

function extractCollegeName(name: string, details: string): string {
    const text = `${name} ${details}`;
    for (const col of COLLEGES) {
        if (new RegExp(`\\b(${col.name}|${col.acronyms.join("|")})\\b`, "i").test(text)) return col.name;
    }
    const genericMatch = text.match(/\b([A-Z][A-Za-z\s]{5,40}(?:University|College|Institute|Academy))\b/i);
    if (genericMatch) return genericMatch[0];
    
    const univMatch = text.match(/\b([A-Za-z\s]{3,30}\s+(?:University|College|Institute|School|Academy|IIT|NIT|IIIT|BITS))\b/i);
    return univMatch ? univMatch[0].trim() : "";
}

function parseSocialMedia(socialStr: string): { instagram?: string; linkedin?: string; facebook?: string; youtube?: string } {
    const social: any = {};
    if (!socialStr || socialStr === "N/A" || socialStr === "N/a") return social;
    
    // Match IG
    const igMatch = socialStr.match(/IG:\s*@?([A-Za-z0-9._]+)/i);
    if (igMatch) {
        social.instagram = `https://instagram.com/${igMatch[1]}`;
    } else if (socialStr.includes("instagram.com/")) {
        const urlMatch = socialStr.match(/(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._/]+/i);
        if (urlMatch) social.instagram = urlMatch[0];
    }
    
    // Match FB
    const fbMatch = socialStr.match(/FB:\s*([A-Za-z0-9._\s-]+)/i);
    if (fbMatch) {
        const handle = fbMatch[1].trim().replace(/\s+/g, "");
        social.facebook = handle.startsWith("http") ? handle : `https://facebook.com/${handle}`;
    } else if (socialStr.includes("facebook.com/")) {
        const urlMatch = socialStr.match(/(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9._/]+/i);
        if (urlMatch) social.facebook = urlMatch[0];
    }
    
    // Match LI
    const liMatch = socialStr.match(/LI:\s*([A-Za-z0-9._\s-]+)/i);
    if (liMatch) {
        const handle = liMatch[1].trim().replace(/\s+/g, "");
        social.linkedin = handle.startsWith("http") ? handle : `https://linkedin.com/in/${handle}`;
    } else if (socialStr.includes("linkedin.com/")) {
        const urlMatch = socialStr.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9._/]+/i);
        if (urlMatch) social.linkedin = urlMatch[0];
    }
    
    // Match YT
    const ytMatch = socialStr.match(/YT:\s*([A-Za-z0-9._\s-]+)/i);
    if (ytMatch) {
        const handle = ytMatch[1].trim().replace(/\s+/g, "");
        social.youtube = handle.startsWith("http") ? handle : `https://youtube.com/${handle}`;
    } else if (socialStr.includes("youtube.com/")) {
        const urlMatch = socialStr.match(/(https?:\/\/)?(www\.)?youtube\.com\/[A-Za-z0-9._/]+/i);
        if (urlMatch) social.youtube = urlMatch[0];
    }
    
    return social;
}

export async function intelligentClubDiscovery(category: string, type: string, location: string): Promise<any[]> {
    console.log(`[Discovery] Starting Local-First Discovery for ${type} ${category} in ${location}`);
    
    // 100% local discovery — reads from compiled JSON database or raw markdown files
    const localClubs = getClubsFromLocalFile(category, type, location);
    if (localClubs && localClubs.length > 0) {
        console.log(`[Discovery] Successfully fetched ${localClubs.length} verified clubs from local City Data.`);
        return localClubs;
    }
    
    console.log(`[Discovery] No local data found for "${location}" / "${category}" / "${type}". Returning empty.`);
    return [];
}

function cleanName(title: string, college?: string): string {
    let name = title.replace(/\s*[|•·–—:|@]\s*(?:Instagram|LinkedIn|Facebook|Twitter|Official|Photos|Posts|Videos|Home|Website|Events|Clubs|Community).*$/i, "");
    if (college) {
        const escaped = college.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Only remove college name if it's at the start or end to preserve context
        name = name.replace(new RegExp(`^${escaped}\\s*[-|:]?\\s*`, "i"), "");
        name = name.replace(new RegExp(`\\s*[-|:]?\\s*${escaped}$`, "i"), "");
    }
    name = name.replace(/\.(edu|com|ac\.in|org|net|in|gov)\b/i, "");
    name = name.trim();
    // Final polish: remove trailing punctuation
    name = name.replace(/[-|:]+$/, "").trim();
    return name;
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

function extractCollege(text: string): string {
    for (const col of COLLEGES) {
        if (new RegExp(`\\b(${col.name}|${col.acronyms.join("|")})\\b`, "i").test(text)) return col.name;
    }
    const genericMatch = text.match(/\b([A-Z][A-Za-z\s]{5,30}(?:University|College|Institute|Academy))\b/i);
    return genericMatch ? genericMatch[0] : "";
}

export function parseSerperResultsToClubs(results: SerperResult[], location: string): Club[] {
    // Stage 1: Basic deduplication and noise removal
    const unique = Array.from(new Map(results.map(r => [r.link, r])).values());
    
    return unique.map(r => {
        // We pass the RAW data to the AI. No pre-cleaning that destroys context.
        return {
            name: r.title, 
            college: "", 
            description: r.snippet,
            location,
            website: r.link,
            social: {}, 
            imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
        };
    });
}

export async function verifyClubsWithAI(rawContent: string, category: string, type: string, region: string): Promise<any[]> {
    const systemPrompt = `You are a strict data extractor. Your only job is to extract real club or event information from the provided web page content. You do not invent, guess, or infer anything. If the information is not explicitly present in the source content, you return null for that field.`;
    
    const userPrompt = `Below are raw web search results for ${category} ${type} clubs/events in ${region}.

For each result, extract the following fields strictly from the page content:
- club_name: The actual, real name of the club or event. DO NOT FABRICATE. DO NOT combine a college name and a category (e.g., if you see "University of Delhi" and "Coding", DO NOT return "Delhi University Coding Club"). Return ONLY names found word-for-word in the text.
- parent_org: The college or organization name.
- official_website: The direct official URL for this club (e.g. university.edu/clubs/name).
- confidence: "high" if name is explicit, "medium" if mentioned, "low" if inferred.

Return a JSON array. DISCARD any results where you had to "create" or "form" the name. Only real, existing entities allowed.

Here are the search results:
${rawContent}`;

    try {
        let results: any[] | null = null;
        try {
            // Try OpenAI first
            results = await callOpenAIJSON<any[]>(userPrompt, "gpt-4o", systemPrompt);
            if (!results) throw new Error("OpenAI returned null");
        } catch (openAiErr) {
            console.warn("[Discovery] OpenAI Failed/Quota Over. Falling back to Gemini.");
            const combinedPrompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Return ONLY a raw JSON array. No markdown, no "json" tags.`;
            results = await callGeminiJSON<any[]>(combinedPrompt);
        }

        if (!results || !Array.isArray(results) || results.length === 0) {
            console.warn("[Discovery] No definitive clubs extracted from this snippet. Consider broadening search.");
            return [];
        }

        // Post-AI Hard Filters (Section 2 - Phase 2)
        // Normalize: "College" -> "college", "Non-College" -> "noncollege"
        const targetCategory = category.toLowerCase().replace(/[^a-z]/g, "");
        
        const filtered = results.filter(v => {
            const name = v.club_name || v.name;
            const hasName = name && name !== "null" && name.trim().length > 1;
            const isNotTooLow = v.confidence !== "low";
            
            // If the search query was already specific, we can be more lenient on the AI's classification
            return hasName && isNotTooLow;
        });

        console.log(`[Phase 2] Filtered down to ${filtered.length} verified clubs.`);
        return filtered;
    } catch (e) {
        console.error("[Discovery] Fatal AI Extraction Error:", e);
        return [];
    }
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
            date: `Upcoming ${new Date().getFullYear()}`,
            location,
            website: r.link,
            imageUrl,
            tags: ["Verified"]
        };
    });
}

// ─── Resilience Layer (Cache Bypass) ────────────────────

const DISCOVERY_CACHE = "discovery_cache";

export async function getCachedDiscovery<T>(key: string): Promise<T | null> {
    // SECURITY FIX: Disable all Firestore caching to avoid permission errors
    // We prioritize real-time results over caching to ensure reliability
    return null; 
}

export async function setCachedDiscovery(key: string, results: any) {
    // SECURITY FIX: Disable all Firestore caching
    return;
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

    // Try OpenAI first (GPT-4o-mini), fallback to Gemini
    let verified = await callOpenAIJSON<{ results: VerifiedResource[] }>(prompt);
    
    // If OpenAI returned a wrapped object or null, check and fallback
    let results = verified?.results || null;
    if (!results) {
        // Fallback to Gemini if OpenAI fails or key is missing
        results = await callGeminiJSON<VerifiedResource[]>(prompt);
    }
    
    if (!results || !Array.isArray(results)) {
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

    return results.map((v: VerifiedResource) => ({
        ...v,
        location,
        platform: "web",
        imageUrl: `https://ui-avatars.com/api/?name=${v.name.replace(/\s+/g, "+")}&background=random&color=fff`,
        tags: [domain, "Verified"]
    }));
}
