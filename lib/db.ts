import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc 
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { Club } from "./types";
  
  const CLUBS_COLLECTION = "clubs";
  
  /**
   * Fetches all clubs owned by or containing the user as a member.
   * Uses parallelism and a timeout to ensure fast initial loading.
   */
  export async function getUserClubs(userId: string, userEmail: string | null): Promise<Club[]> {
    if (!db) return [];
  
    try {
      const mappedClubs = new Map<string, Club>();

      // Parallelize queries with a safety timeout (8s)
      const fetchPromise = (async () => {
        const queries = [
          query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId))
        ];

        if (userEmail) {
          queries.push(query(collection(db, CLUBS_COLLECTION), where("memberEmails", "array-contains", userEmail)));
        }

        const snapshots = await Promise.all(queries.map(q => getDocs(q)));
        
        snapshots.forEach(snapshot => {
          snapshot.docs.forEach(d => mappedClubs.set(d.id, d.data() as Club));
        });

        return Array.from(mappedClubs.values());
      })();

      // Timeout wrapper to prevent hanging forever
      const timeoutPromise = new Promise<Club[]>((_, reject) => 
        setTimeout(() => reject(new Error("Database fetch timed out")), 8000)
      );

      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      console.error("Error fetching clubs from Firestore:", error);
      // Return empty array instead of hanging the entire app
      return [];
    }
  }
  
  /**
   * Saves or entirely updates a single club document.
   * Denormalizes member emails into a flat array for efficient querying.
   */
  export async function saveClub(club: Club & { ownerId: string }): Promise<boolean> {
    if (!db) return false;
  
    try {
      const clubRef = doc(db, CLUBS_COLLECTION, club.id);
      // Denormalize member emails for array-contains queries
      const memberEmails = (club.members || []).map(m => m.email).filter(Boolean);
      await setDoc(clubRef, { ...club, memberEmails }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving club to Firestore:", error);
      return false;
    }
  }
  
  /**
   * Deletes a club document from Firestore.
   */
  export async function deleteClubFromDb(clubId: string): Promise<boolean> {
    if (!db) return false;
  
    try {
      await deleteDoc(doc(db, CLUBS_COLLECTION, clubId));
      return true;
    } catch (error) {
      console.error("Error deleting club:", error);
      return false;
    }
  }
