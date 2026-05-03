import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { auth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.error("Auth Listener Error:", error);
        // If we hit an internal error, allow the app to load in guest mode
        if (error.message?.includes("internal-error")) {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Fatal Auth Initialization Error:", e);
      setLoading(false);
    }
  }, []);


  return { user, loading };
}
