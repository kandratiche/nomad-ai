import React, { createContext, useEffect, useState, useRef, useCallback } from "react";
import { clearSession, getSession, setSessionUser } from "@/lib/authSession";
import { getCurrentUserApi } from "@/api/services/authApi";

type AuthContextType = {
  user: any;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  pendingInterests: string[];
  setPendingInterests: React.Dispatch<React.SetStateAction<string[]>>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  pendingInterests: [],
  setPendingInterests: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, _setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef<{ data: any; ts: number } | null>(null);
  const [pendingInterests, setPendingInterests] = useState<string[]>([]);

  const setUser: React.Dispatch<React.SetStateAction<any>> = useCallback((value) => {
    _setUser((prev: any) => {
      const next = typeof value === "function" ? (value as (p: any) => any)(prev) : value;
      if (next) {
        setSessionUser(next).catch(() => {});
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (Array.isArray(user?.interests)) {
      setPendingInterests(user.interests);
    }
  }, [user?.interests]);

  const fetchCurrentUser = useCallback(async () => {
    if (cacheRef.current && Date.now() - cacheRef.current.ts < 30_000) {
      return cacheRef.current.data;
    }

    const data = await getCurrentUserApi();
    if (data) {
      cacheRef.current = { data, ts: Date.now() };
    }
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const session = await getSession();
        if (!session?.accessToken) {
          if (mounted) setUser(null);
          return;
        }

        if (session.user && mounted) {
          setUser(session.user);
        }

        const profile = await fetchCurrentUser();
        if (mounted && profile) {
          setUser(profile);
        }
      } catch (err) {
        console.warn("Failed to restore auth session:", err);
        await clearSession();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentUser, setUser]);

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
