import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc,
    onSnapshot,
    Unsubscribe,
    or,
    getDocsFromCache,
    getDocsFromServer
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { Club, ScrapedClub } from "./types";
  
  const CLUBS_COLLECTION = "clubs";
  const SAVED_CLUBS_COLLECTION = "saved_explore_clubs";
  
  /**
   * Subscribes to real-time updates for clubs where the user is an owner or member.
   * Merges results from both queries and returns a combined unregister function.
   */
  /**
   * Subscribes to real-time updates for clubs where the user is an owner or member.
   * Uses a single consolidated query for maximum performance.
   */
  export function subscribeUserClubs(
    userId: string, 
    userEmail: string | null, 
    onUpdate: (clubs: Club[]) => void
  ): Unsubscribe {
    if (!db) return () => {};

    // Consolidate owner and member checks into a single query
    const clubsQuery = userEmail 
      ? query(
          collection(db, CLUBS_COLLECTION), 
          or(
            where("ownerId", "==", userId),
            where("memberEmails", "array-contains", userEmail)
          )
        )
      : query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId));

    return onSnapshot(clubsQuery, (snapshot) => {
      const fetchedClubs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Club));
      onUpdate(fetchedClubs);
    }, (error) => {
      console.error("Clubs subscription error:", error);
    });
  }

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

  /**
   * Subscribes to clubs that the user has "saved" from the Explore page.
   */
  export function subscribeSavedExploreClubs(
    userId: string, 
    onUpdate: (clubs: ScrapedClub[]) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const q = query(collection(db, SAVED_CLUBS_COLLECTION), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const clubs = snapshot.docs.map(d => d.data().club as ScrapedClub);
      onUpdate(clubs);
    }, (error) => {
      console.error("Saved clubs subscription error:", error);
    });
  }

  /**
   * Saves a club from the Explore page to the user's permanent account.
   */
  export async function saveExploreClub(userId: string, club: ScrapedClub): Promise<boolean> {
    if (!db) return false;
    try {
      // Create a unique but deterministic ID for the saved club per user
      const docId = `${userId}_${club.name}_${club.college}`.replace(/[#/]/g, '_');
      await setDoc(doc(db, SAVED_CLUBS_COLLECTION, docId), {
        userId,
        club,
        savedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Error saving explore club:", error);
      return false;
    }
  }

  /**
   * Removes a previously saved explore club.
   */
  export async function removeExploreClub(userId: string, clubName: string, college: string): Promise<boolean> {
    if (!db) return false;
    try {
      const docId = `${userId}_${clubName}_${college}`.replace(/[#/]/g, '_');
      await deleteDoc(doc(db, SAVED_CLUBS_COLLECTION, docId));
      return true;
    } catch (error) {
      console.error("Error removing explore club:", error);
      return false;
    }
  }
