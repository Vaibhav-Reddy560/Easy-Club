/**
 * Ayrshare Service Utility
 * Handles social media analytics fetching via Ayrshare API.
 */

const API_KEY = process.env.AYRSHARE_API_KEY;
const API_URL = "https://api.ayrshare.com/api/analytics";

export interface AyrshareAnalytics {
    likes: number;
    shares: number;
    impressions: number;
    followerGrowth: number;
    lastUpdated: string;
    isMock?: boolean;
}

let cachedAnalytics: AyrshareAnalytics | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAyrshareAnalytics(): Promise<AyrshareAnalytics> {
    // Return mock data if API key is missing
    if (!API_KEY) {
        console.warn("[Ayrshare] API Key missing. Returning mock data.");
        return getMockData();
    }

    // Use cache if available and not expired
    if (cachedAnalytics && (Date.now() - lastCacheTime) < CACHE_TTL) {
        return cachedAnalytics;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        // Profile Analytics endpoint is usually /api/analytics/profile or /api/analytics
        // We'll try the main analytics endpoint which aggregates data
        const response = await fetch("https://api.ayrshare.com/api/analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                lastDays: 30
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 403) {
            console.error("[Ayrshare] 403 Forbidden - This usually means no social accounts are linked to this API Key.");
            // Return mock data but mark it as needing connection
            const mock = getMockData();
            return { ...mock, isMock: true };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Ayrshare API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Map real data to our interface
        const mappedData = {
            likes: data.analytics?.totalLikes || data.analytics?.postLikes || 0,
            shares: data.analytics?.totalShares || data.analytics?.postShares || 0,
            impressions: data.analytics?.totalImpressions || data.analytics?.postImpressions || 0,
            followerGrowth: data.analytics?.totalFollowerGrowth || data.analytics?.followerGrowth || 0,
            lastUpdated: new Date().toISOString(),
            isMock: false
        };
        
        cachedAnalytics = mappedData;
        lastCacheTime = Date.now();
        return mappedData;
    } catch (error) {
        console.error("[Ayrshare] Fetch failed, falling back to mock:", error);
        return getMockData();
    }
}

function getMockData(): AyrshareAnalytics {
    return {
        likes: 1875,
        shares: 42,
        impressions: 12400,
        followerGrowth: 156,
        lastUpdated: new Date().toISOString(),
        isMock: true
    };
}

/**
 * Generates a Social Link JWT for a user to connect their social profiles.
 * In a real-world app, 'profileKey' is unique to each organization/user.
 */
export async function generateSocialLinkJWT(): Promise<string | null> {
    if (!API_KEY) {
        console.error("[Ayrshare] Missing API Key for JWT generation.");
        return null;
    }

    try {
        const response = await fetch("https://api.ayrshare.com/api/profiles/generate-jwt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                domain: "easy-club-management" // Change this to your actual app name
            })
        });

        if (!response.ok) {
            throw new Error(`Ayrshare JWT error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error("[Ayrshare] JWT generation failed:", error);
        return null;
    }
}
