"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAccount } from "@/services/auth/interface";
import { WithId } from "mongodb";

type UserAccountType = WithId<UserAccount> | null;

interface AuthContextType {
  user: UserAccountType | null;
  status: "authenticated" | "loading" | "unauthenticated";
  loading: boolean;
  error: string;

  // Actions
  loginWithGoogle: (redirectValue?: string) => void;
  logout: () => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserAccountType | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"authenticated" | "loading" | "unauthenticated">("loading");
  const [error, setError] = useState("");

  const router = useRouter();

  // The httpOnly session cookie is the single source of truth, so the user is
  // resolved from GET /auth/api on mount rather than from a client SDK.
  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch("/auth/api", { cache: "no-store" });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
            setStatus("unauthenticated");
          }
          return;
        }

        const result = await response.json();
        if (cancelled) return;

        if (result?.user) {
          setUser(result.user as UserAccountType);
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = useCallback(() => setError(""), []);

  // Hand off to the server route that owns the Google OAuth redirect.
  const loginWithGoogle = useCallback((redirectValue = "/") => {
    setError("");
    router.push(`/auth/google?redirect=${encodeURIComponent(redirectValue)}`);
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/auth/api", { method: "DELETE" });
    } catch {
      // The cookie is cleared server-side; a network failure here is not fatal.
    }

    setUser(null);
    setStatus("unauthenticated");
    router.push("/");
    router.refresh();
  }, [router]);

  const updatePhone = useCallback(async (phone: string) => {
    const response = await fetch("/auth/api", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update phone number.");
    }

    setUser((currentUser) =>
      currentUser ? { ...currentUser, phone } : currentUser
    );
  }, []);

  const value: AuthContextType = {
    user,
    status,
    loading,
    error,
    loginWithGoogle,
    logout,
    updatePhone,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
