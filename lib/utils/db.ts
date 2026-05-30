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
  import { db, auth } from "@/lib/services/firebase";
  import { signOut } from "firebase/auth";
  import { Club, ScrapedClub, TeamInvite, ClubMember } from "@/lib/types";
  
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
    onUpdate: (clubs: Club[], isSyncing: boolean) => void
  ): Unsubscribe {
    if (!db) return () => {};

    const clubsMap = new Map<string, Club>();
    let ownerSyncing = true;
    let memberSyncing = userEmail ? true : false;
    
    const updateResults = (snapshot: any, isMember: boolean) => {
      // If we got metadata from server, or it's no longer from cache, we are synced
      const fromCache = snapshot.metadata.fromCache;
      const hasPendingWrites = snapshot.metadata.hasPendingWrites;

      if (isMember) memberSyncing = fromCache;
      else ownerSyncing = fromCache;

      snapshot.docs.forEach((d: any) => {
        clubsMap.set(d.id, { ...d.data(), id: d.id } as Club);
      });

      // We are synced if both are no longer purely from cache, OR if we have pending writes (optimistic)
      // Actually, if fromCache is true, it means we are still waiting for the server to confirm the latest snapshot.
      onUpdate(Array.from(clubsMap.values()), ownerSyncing || memberSyncing);
    };

    // Query 1: Clubs owned by user
    const ownerQuery = query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId));
    const unsubOwner = onSnapshot(ownerQuery, { includeMetadataChanges: true }, (snap) => updateResults(snap, false), (err) => console.error("Owner clubs sub error:", err));

    // Query 2: Clubs where user is a member
    let unsubMember = () => {};
    if (userEmail) {
      const normalizedEmail = userEmail.toLowerCase();
      const memberQuery = query(collection(db, CLUBS_COLLECTION), where("memberEmails", "array-contains", normalizedEmail));
      unsubMember = onSnapshot(memberQuery, { includeMetadataChanges: true }, (snap) => updateResults(snap, true), (err) => console.error("Member clubs sub error:", err));
    }

    return () => {
      unsubOwner();
      unsubMember();
    };
  }

  export async function getAllUserMembers(userId: string, userEmail: string | null): Promise<{ member: ClubMember, clubName: string, clubId: string }[]> {
    const clubs = await getUserClubs(userId, userEmail);
    const allMembers: { member: ClubMember, clubName: string, clubId: string }[] = [];
    
    clubs.forEach(club => {
      // Add regular members
      (club.members || []).forEach(member => {
        allMembers.push({ member, clubName: club.name, clubId: club.id });
      });
      
      // Add owner as a member if not already present (owners often act as admins)
      if (club.ownerId && club.ownerEmail && !club.members?.some(m => m.id === club.ownerId)) {
        allMembers.push({
          member: {
            id: club.ownerId,
            name: club.ownerName || "Founder",
            email: club.ownerEmail,
            role: 'Admin',
            joinDate: club.lastUpdated || new Date().toISOString(),
            basis: 'Fee Paid',
            skills: (club as any).ownerSkills || []
          },
          clubName: club.name,
          clubId: club.id
        });
      }
    });
    
    return allMembers;
  }

  export async function getUserClubs(userId: string, userEmail: string | null): Promise<Club[]> {
    if (!db) return [];
  
    try {
      const mappedClubs = new Map<string, Club>();

      const queries = [
        query(collection(db, CLUBS_COLLECTION), where("ownerId", "==", userId))
      ];
      if (userEmail) {
        queries.push(query(collection(db, CLUBS_COLLECTION), where("memberEmails", "array-contains", userEmail.toLowerCase())));
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
      // Denormalize member emails for array-contains queries - use lowercase for search reliability
      const memberEmails = (club.members || []).map(m => m.email.toLowerCase()).filter(Boolean);
      
      // Ensure ownerId is ALWAYS present and correct
      const rawPayload = { 
        ...club, 
        memberEmails, 
        lastUpdated: new Date().toISOString() 
      };
      
      // Deep clone to remove undefined values and React proxies which cause Firestore "invalid nested entity" errors
      const payload = JSON.parse(JSON.stringify(rawPayload));
      
      await setDoc(clubRef, payload, { merge: true });
      console.log(`[Firestore] Successfully saved club: ${club.name} (${club.id})`);
      return true;
    } catch (error: any) {
      console.error("[Firestore] Error saving club:", error);
      if (error.code === 'permission-denied') {
        alert("Permission Denied: You do not have authority to save changes to this club.");
      }
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
      console.log(`[Firestore] Deleted club: ${clubId}`);
      return true;
    } catch (error) {
      console.error("[Firestore] Error deleting club:", error);
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
      // SILENT FALLBACK: If permissions fail, we just don't sync. This prevents the "Missing Permissions" console spam.
      console.warn("[Firestore] Saved clubs subscription paused (likely permissions).");
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
      console.log(`[Firestore] Saved explore club: ${club.name}`);
      return true;
    } catch (error) {
      console.error("[Firestore] Error saving explore club:", error);
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

  /**
   * Creates a new team invitation for a club.
   */
  export async function createTeamInvite(clubId: string, email: string, role: string): Promise<string | null> {
    if (!db) return null;
    try {
        const inviteId = `inv_${Math.random().toString(36).substring(2, 15)}`;
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        
        const invite: TeamInvite = {
            id: inviteId,
            email: email.toLowerCase(),
            role: role as any,
            status: 'pending',
            sentAt: new Date().toISOString()
        };

        // We store invites within the club document for simplicity in this architecture
        // In a larger app, a separate 'invites' collection might be better
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return null;
        
        const clubData = snapshot.docs[0].data() as Club;
        const currentInvites = clubData.invites || [];
        
        await setDoc(doc(db, CLUBS_COLLECTION, clubId), {
            ...clubData,
            invites: [...currentInvites, invite]
        }, { merge: true });

        return inviteId;
    } catch (error) {
        console.error("Error creating invite:", error);
        return null;
    }
  }

  /**
   * Verifies an invite token and adds the user to the club.
   */
  export async function verifyAndAcceptInvite(inviteId: string, clubId: string, user: { id: string, email: string, name: string }): Promise<{ success: boolean, clubName?: string, error?: string }> {
    if (!db) return { success: false, error: "Database not initialized" };
    
    try {
        // Direct document lookup is faster and avoids permission issues with collection scanning
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        
        if (snapshot.empty) {
            return { success: false, error: "Club not found" };
        }

        const targetClub = snapshot.docs[0].data() as Club;
        const targetInvite = targetClub.invites?.find(i => i.id === inviteId);

        if (!targetInvite) {
            return { success: false, error: "Invalid or expired invitation link" };
        }

        if (targetInvite.status !== 'pending') {
            return { success: false, error: "This invitation has already been used" };
        }

        // Security: Ensure email matches if specified in invite (optional, but professional)
        if (targetInvite.email && targetInvite.email.toLowerCase() !== user.email.toLowerCase()) {
            return { success: false, error: `This invite was intended for ${targetInvite.email}` };
        }

        // Add user to members
        const newMember: ClubMember = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: targetInvite.role,
            joinDate: new Date().toISOString(),
            basis: 'Fee Paid' // Default for team invites
        };

        const updatedMembers = [...(targetClub.members || []), newMember];
        const updatedInvites = targetClub.invites?.map(i => 
            i.id === inviteId ? { ...i, status: 'accepted' as const } : i
        );

        // Crucial: Update the denormalized memberEmails array so the user's dashboard can find this club
        const memberEmails = updatedMembers.map(m => m.email.toLowerCase()).filter(Boolean);

        await setDoc(doc(db, CLUBS_COLLECTION, clubId), {
            ...targetClub,
            members: updatedMembers,
            invites: updatedInvites,
            memberEmails,
            lastUpdated: new Date().toISOString()
        }, { merge: true });

        return { success: true, clubName: targetClub.name };
    } catch (error) {
        console.error("Error accepting invite:", error);
        return { success: false, error: "Internal server error while processing invite" };
    }
  }

  export async function getClubMetadata(clubId: string): Promise<{ name: string } | null> {
    if (!db) return null;
    try {
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return null;
        const data = snapshot.docs[0].data();
        return { name: data.name };
    } catch (e) {
        return null;
    }
  }

  export async function signOutUser() {
    if (auth) {
      await signOut(auth);
    }
  }

  /**
   * COLLAB HUB FUNCTIONS
   */

  export async function getAllPublicClubs(): Promise<Club[]> {
    if (!db) return [];
    try {
        const q = query(collection(db, CLUBS_COLLECTION), where("collabPreferences.isVisible", "==", true));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Club));
    } catch (e) {
        console.error("Error fetching public clubs:", e);
        return [];
    }
  }

  export async function updateCollabPreferences(clubId: string, prefs: any) {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        await setDoc(clubRef, { collabPreferences: prefs }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error updating collab prefs:", e);
        return false;
    }
  }

  export async function sendCollabRequest(fromClub: { id: string, name: string }, toClubId: string, message: string, ideas: string[]) {
    if (!db) return false;
    try {
        const toClubRef = doc(db, CLUBS_COLLECTION, toClubId);
        const request = {
            id: `req_${Date.now()}`,
            fromClubId: fromClub.id,
            fromClubName: fromClub.name,
            toClubId,
            toClubName: "", // Will be filled by receiver if needed or just use ID
            status: 'pending',
            sentAt: new Date().toISOString(),
            message,
            interestedInIdeas: ideas
        };

        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", toClubId)));
        if (snapshot.empty) return false;
        
        const targetClub = snapshot.docs[0].data() as Club;
        const currentRequests = targetClub.collabRequests || [];
        
        await setDoc(toClubRef, {
            collabRequests: [...currentRequests, request]
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error sending collab request:", e);
        return false;
    }
  }

  export async function respondToCollabRequest(clubId: string, requestId: string, response: 'accepted' | 'declined') {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        
        const club = snapshot.docs[0].data() as Club;
        const request = club.collabRequests?.find(r => r.id === requestId);
        if (!request) return false;

        // 1. Update the request status
        const updatedRequests = club.collabRequests?.map(r => 
            r.id === requestId ? { ...r, status: response } : r
        );

        // 2. If accepted, create a Collaboration object for BOTH clubs
        if (response === 'accepted') {
            const collabId = `collab_${Date.now()}`;
            
            // For the current club (acceptor)
            const newCollabForAcceptor = {
                id: collabId,
                partnerClubId: request.fromClubId,
                partnerClubName: request.fromClubName,
                sharedEvents: [],
                activityLog: [],
                messages: [],
                startedAt: new Date().toISOString()
            };

            // For the sender club
            const fromClubRef = doc(db, CLUBS_COLLECTION, request.fromClubId);
            const fromClubSnap = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", request.fromClubId)));
            if (!fromClubSnap.empty) {
                const fromClub = fromClubSnap.docs[0].data() as Club;
                const newCollabForSender = {
                    id: collabId,
                    partnerClubId: club.id,
                    partnerClubName: club.name,
                    sharedEvents: [],
                    activityLog: [],
                    messages: [],
                    startedAt: new Date().toISOString()
                };
                await setDoc(fromClubRef, {
                    activeCollabs: [...(fromClub.activeCollabs || []), newCollabForSender]
                }, { merge: true });
            }

            await setDoc(clubRef, {
                collabRequests: updatedRequests,
                activeCollabs: [...(club.activeCollabs || []), newCollabForAcceptor]
            }, { merge: true });
        } else {
            await setDoc(clubRef, { collabRequests: updatedRequests }, { merge: true });
        }
        return true;
    } catch (e) {
        console.error("Error responding to collab request:", e);
        return false;
    }
  }

  export async function sendCollabMessage(clubId: string, collabId: string, sender: { id: string, name: string }, text: string) {
    if (!db) return false;
    try {
        // This is a simplified "dual-update" message sync. In a production app,
        // messages would be in a separate sub-collection.
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        
        const club = snapshot.docs[0].data() as Club;
        const collab = club.activeCollabs?.find(c => c.id === collabId);
        if (!collab) return false;

        const newMessage = {
            id: `msg_${Date.now()}`,
            senderId: sender.id,
            senderName: sender.name,
            text,
            timestamp: new Date().toISOString()
        };

        // Update current club
        const updatedCollabs = club.activeCollabs?.map(c => 
            c.id === collabId ? { ...c, messages: [...(c.messages || []), newMessage] } : c
        );
        await setDoc(doc(db, CLUBS_COLLECTION, clubId), { activeCollabs: updatedCollabs }, { merge: true });

        // Update partner club
        const partnerRef = doc(db, CLUBS_COLLECTION, collab.partnerClubId);
        const partnerSnap = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", collab.partnerClubId)));
        if (!partnerSnap.empty) {
            const partnerClub = partnerSnap.docs[0].data() as Club;
            const updatedPartnerCollabs = partnerClub.activeCollabs?.map(c => 
                c.id === collabId ? { ...c, messages: [...(c.messages || []), newMessage] } : c
            );
            await setDoc(partnerRef, { activeCollabs: updatedPartnerCollabs }, { merge: true });
        }
        return true;
    } catch (e) {
        console.error("Error sending collab message:", e);
        return false;
    }
  }

  export async function saveMeetingMinutes(clubId: string, mom: any) {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        const club = snapshot.docs[0].data() as Club;
        const currentMOMs = club.meetingMinutes || [];
        await setDoc(clubRef, {
            meetingMinutes: [...currentMOMs, mom]
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error saving meeting minutes:", e);
        return false;
    }
  }

  export async function assignTask(clubId: string, task: any) {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        const club = snapshot.docs[0].data() as Club;
        const currentTasks = club.assignedTasks || [];
        await setDoc(clubRef, {
            assignedTasks: [...currentTasks, task]
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error assigning task:", e);
        return false;
    }
  }

  export async function updateTaskProgress(clubId: string, taskId: string, updates: any) {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        const club = snapshot.docs[0].data() as Club;
        const updatedTasks = club.assignedTasks?.map(t => 
            t.id === taskId ? { ...t, ...updates } : t
        ) || [];
        await setDoc(clubRef, {
            assignedTasks: updatedTasks
        }, { merge: true });
        return true;
    } catch (e) {
        console.error("Error updating task progress:", e);
        return false;
    }
  }

  export async function updateMemberSkills(clubId: string, memberId: string, skills: (string | any)[]) {
    if (!db) return false;
    try {
        const clubRef = doc(db, CLUBS_COLLECTION, clubId);
        const snapshot = await getDocs(query(collection(db, CLUBS_COLLECTION), where("id", "==", clubId)));
        if (snapshot.empty) return false;
        const club = snapshot.docs[0].data() as Club;
        
        if (club.ownerId === memberId) {
            await setDoc(clubRef, { ownerSkills: skills }, { merge: true });
        } else {
            const updatedMembers = club.members?.map(m => 
                m.id === memberId ? { ...m, skills } : m
            ) || [];
            await setDoc(clubRef, { members: updatedMembers }, { merge: true });
        }
        return true;
    } catch (e) {
        console.error("Error updating member skills:", e);
        return false;
    }
  }
