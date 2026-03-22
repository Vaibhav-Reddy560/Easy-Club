import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    GithubAuthProvider,
    TwitterAuthProvider
} from "firebase/auth";
import { 
    doc, 
    updateDoc, 
    getDoc,
    setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const linkSocialAccount = async (clubId: string, platform: 'google' | 'github' | 'x') => {
    if (!auth || !db) return;

    let provider;
    switch (platform) {
        case 'google':
            provider = new GoogleAuthProvider();
            break;
        case 'github':
            provider = new GithubAuthProvider();
            break;
        case 'x':
            provider = new TwitterAuthProvider();
            break;
        default:
            throw new Error("Unsupported platform");
    }

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // In a real app, we might store the access token from result
        // For this demo, we'll mark it as connected in Firestore
        // result holds the credential and token if needed
        
        const clubRef = doc(db, "clubs", clubId);
        const connectionData = {
            [`socialConnections.${platform}`]: {
                lastConnected: new Date().toISOString(),
                isConnected: true,
                platformName: platform.charAt(0).toUpperCase() + platform.slice(1)
            }
        };

        // Check if club exists first
        const clubSnap = await getDoc(clubRef);
        if (clubSnap.exists()) {
            await updateDoc(clubRef, connectionData);
        } else {
            // If club doesn't exist yet in Firestore, create it
            await setDoc(clubRef, {
                id: clubId,
                socialConnections: {
                    [platform]: {
                        lastConnected: new Date().toISOString(),
                        isConnected: true,
                        platformName: platform.charAt(0).toUpperCase() + platform.slice(1)
                    }
                }
            }, { merge: true });
        }

        return { success: true, user };
    } catch (error) {
        console.error("Link error:", error);
        throw error;
    }
};
