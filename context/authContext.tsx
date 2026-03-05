import React, { createContext, useEffect, useState, useRef, useCallback } from "react";
import supabase from "@/lib/supabaseClient";

type AuthContextType = {
  user: any;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;

  /**
   * Interests the user has been toggling in the onboarding/edit screens but
   * haven't necessarily been persisted to the server yet. This allows us to
   * keep a draft selection when the screen unmounts (e.g. hitting back) so
   * the choices don't vanish immediately. Stored as a simple string array for
   * serialization ease.
   */
  pendingInterests: string[];
  setPendingInterests: React.Dispatch<React.SetStateAction<string[]>>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef<string | null>(null);
  const cacheRef = useRef<{ id: string; data: any; ts: number } | null>(null);

  const [pendingInterests, setPendingInterests] = useState<string[]>([]);

  // whenever we load a fresh profile from the server, make sure the draft
  // interests mirror whatever is stored. This happens on initial fetch and
  // also after `setUser` is called following a save.
  useEffect(() => {
    if (Array.isArray(user?.interests)) {
      setPendingInterests(user.interests);
    }
  }, [user?.interests]);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (cacheRef.current && cacheRef.current.id === userId && Date.now() - cacheRef.current.ts < 30_000) {
      return cacheRef.current.data;
    }
    if (fetchingRef.current === userId) return null;
    fetchingRef.current = userId;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
      cacheRef.current = { id: userId, data, ts: Date.now() };
      return data;
    } finally {
      fetchingRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        if (sessionUser && mounted) {
          const profile = await fetchUserProfile(sessionUser.id);
          if (mounted && profile) setUser(profile);
        }
      } catch (err) {
        console.warn("Failed to get session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    let listener: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          if (event === "INITIAL_SESSION") return;
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            if (mounted && profile) setUser(profile);
          } else {
            setUser(null);
            cacheRef.current = null;
          }
        },
      );
      listener = data;
    } catch (err) {
      console.warn("Failed to subscribe to auth changes:", err);
    }

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        pendingInterests,
        setPendingInterests,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
