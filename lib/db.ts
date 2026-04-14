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
   */
  export async function getUserClubs(userId: string, userEmail: string | null): Promise<Club[]> {
    if (!db) return [];
  
    try {
      const mappedClubs = new Map<string, Club>();

      // 1. Fetch clubs where user is the owner (indexed query, fast)
      const ownerQuery = query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId));
      const ownerSnapshot = await getDocs(ownerQuery);
      ownerSnapshot.docs.forEach(d => mappedClubs.set(d.id, d.data() as Club));

      // 2. Fetch clubs where user is a team member via denormalized email array
      // Uses array-contains which is a single indexed lookup in Firestore
      if (userEmail) {
        const memberQuery = query(collection(db, CLUBS_COLLECTION), where("memberEmails", "array-contains", userEmail));
        const memberSnapshot = await getDocs(memberQuery);
        memberSnapshot.docs.forEach(d => {
          if (!mappedClubs.has(d.id)) mappedClubs.set(d.id, d.data() as Club);
        });
      }

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
