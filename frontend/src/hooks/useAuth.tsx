/**
 * useAuth.tsx
 * -----------
 * Auth context backed by the local mockAuth layer.
 * No Supabase email confirmation needed — works offline too.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMockSession, mockSignOut, MockUser } from "@/lib/mockAuth";

interface AuthContextValue {
  user: MockUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the session that mockSignIn / mockSignUp stored in localStorage
    const session = getMockSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  const signOut = async () => {
    mockSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
