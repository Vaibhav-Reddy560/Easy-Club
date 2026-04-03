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
      // 1. Fetch clubs where user is the owner
      const ownerQuery = query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId));
      const ownerSnapshot = await getDocs(ownerQuery);
      
      const ownerClubs = ownerSnapshot.docs.map(doc => doc.data() as Club);
  
      // NOTE: In a true production app, querying for membership would require an array-contains
      // setup or a separate members collection. For simplicity and to match the current 
      // document structure with a flat `members` array of objects, we will fetch all clubs
      // and filter locally if they aren't the owner, OR we just trust `ownerClubs` for now 
      // along with any clubs where their email is in the members list.
      // Firestore cannot do 'array-contains' on an array of objects directly based on a specific field.
      // Therefore, if they are not the owner, we have to fetch clubs where they are invited.
      // We will perform a simple fallback:
      
      const allSnapshot = await getDocs(collection(db, CLUBS_COLLECTION));
      const allClubs = allSnapshot.docs.map(doc => doc.data() as Club);
      
      // Merge unique clubs where they are owner OR their email is inside members array
      const mappedClubs = new Map<string, Club>();
      
      allClubs.forEach(club => {
        if (club.ownerId === userId) {
            mappedClubs.set(club.id, club);
        } else if (userEmail && club.members?.some(m => m.email === userEmail)) {
            mappedClubs.set(club.id, club);
        }
      });
  
      return Array.from(mappedClubs.values());
    } catch (error) {
      console.error("Error fetching clubs from Firestore:", error);
      return [];
    }
  }
  
  /**
   * Saves or entirely updates a single club document.
   */
  export async function saveClub(club: Club & { ownerId: string }): Promise<boolean> {
    if (!db) return false;
  
    try {
      const clubRef = doc(db, CLUBS_COLLECTION, club.id);
      await setDoc(clubRef, club, { merge: true });
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
