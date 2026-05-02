import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import { useGetMe, setAuthTokenGetter, setSessionIdGetter } from "@workspace/api-client-react";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem("pearlis_session_id");
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("pearlis_session_id", id);
  }
  return id;
}

interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("token"));
  const [dbUser, setDbUser] = useState<AuthUser | null>(null);
  const [syncing, setSyncing] = useState(false);
  const syncedClerkId = useRef<string | null>(null);

  useEffect(() => {
    setSessionIdGetter(() => getOrCreateSessionId());
    setAuthTokenGetter(async () => {
      if (clerkUser) {
        try { return await getToken(); } catch { return null; }
      }
      return localStorage.getItem("token");
    });
  }, [clerkUser, getToken]);

  useEffect(() => {
    if (!clerkLoaded) return;
    if (!clerkUser) {
      setDbUser(null);
      syncedClerkId.current = null;
      return;
    }
    if (syncedClerkId.current === clerkUser.id) return;

    setSyncing(true);
    getToken()
      .then((token) =>
        fetch("/api/auth/clerk-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            name: clerkUser.fullName || clerkUser.username || "User",
            avatar: clerkUser.imageUrl || null,
          }),
        })
      )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setDbUser(data);
          syncedClerkId.current = clerkUser.id;
        }
      })
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [clerkUser, clerkLoaded, getToken]);

  const { data: adminUser, isLoading: adminLoading } = useGetMe({
    query: { enabled: !!adminToken && !clerkUser, retry: false },
  });

  const user: AuthUser | null = clerkUser ? dbUser : (adminUser as AuthUser | undefined) ?? null;
  const isLoading =
    !clerkLoaded ||
    (clerkLoaded && !!clerkUser && (syncing || !dbUser)) ||
    (!!adminToken && !clerkUser && adminLoading);
  const isAdmin = !clerkUser && (adminUser as any)?.role === "admin";

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setAdminToken(token);
  };

  const logout = async () => {
    if (clerkUser) {
      try { await signOut(); } catch {}
    }
    localStorage.removeItem("token");
    setAdminToken(null);
    setDbUser(null);
    syncedClerkId.current = null;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
