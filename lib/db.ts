import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc,
    getDocsFromCache 
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { Club } from "./types";
  
  const CLUBS_COLLECTION = "clubs";
  
  export async function getUserClubs(userId: string, userEmail: string | null): Promise<Club[]> {
    if (!db) return [];
  
    try {
      const mappedClubs = new Map<string, Club>();

      const queries = [
        query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId))
      ];
      if (userEmail) {
        queries.push(query(collection(db, CLUBS_COLLECTION), where("memberEmails", "array-contains", userEmail)));
      }

      // 1. Try Cache First for INSTANT loading speed
      try {
        const cacheSnapshots = await Promise.all(queries.map(q => getDocsFromCache(q)));
        cacheSnapshots.forEach(snapshot => {
          snapshot.docs.forEach(d => mappedClubs.set(d.id, d.data() as Club));
        });
        
        // If we found clubs in cache, we can return immediately for an instant UI update!
        // The service worker / background sync will handle the rest later.
        if (mappedClubs.size > 0) {
          return Array.from(mappedClubs.values());
        }
      } catch (e) {
        // Cache read might fail if it's the very first time, which is fine!
      }

      // 2. If Cache was empty (first load), fetch from server with a safety timeout (8s)
      // 2. If Cache was empty (first load), fetch from server
      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(d => mappedClubs.set(d.id, d.data() as Club));
      });
      return Array.from(mappedClubs.values());
    } catch (error) {
      console.error("Error fetching clubs from Firestore:", error);
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
