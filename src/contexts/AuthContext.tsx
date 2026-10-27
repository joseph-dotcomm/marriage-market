import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../../lib/supabase";

type ProfileStatus = "pending" | "active" | "suspended" | "deleted";

type Profile = {
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  country_code: string | null;
  city: string | null;
  biography: string | null;
  account_status: ProfileStatus;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  profileError: string | null;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const requestId = useRef(0);

  const loadAccount = useCallback(async (userId: string) => {
    const [profileResult, adminResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "user_id, display_name, date_of_birth, country_code, city, biography, account_status",
        )
        .eq("user_id", userId)
        .single(),
      supabase.rpc("is_admin"),
    ]);

    if (profileResult.error) {
      setProfile(null);
      setProfileError(profileResult.error.message);
    } else {
      setProfile(profileResult.data as Profile);
      setProfileError(null);
    }

    if (adminResult.error) {
      setIsAdmin(false);
      setProfileError(
        (previous) => previous ?? "Unable to verify administrator permissions.",
      );
    } else {
      setIsAdmin(adminResult.data === true);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setProfile(null);
      setIsAdmin(false);
      setProfileError("Authentication required.");
      return;
    }

    await loadAccount(data.user.id);
  }, [loadAccount]);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const current = ++requestId.current;

      const { data, error } = await supabase.auth.getSession();

      if (!mounted || current !== requestId.current) return;

      if (error || !data.session) {
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (!mounted || current !== requestId.current) return;

      if (userError || !userData.user) {
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setSession(data.session);
      await loadAccount(userData.user.id);

      if (mounted && current === requestId.current) {
        setLoading(false);
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        const current = ++requestId.current;

        setSession(newSession);
        setProfileError(null);

        if (event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }

        if (event === "SIGNED_OUT") {
          setPasswordRecovery(false);
        }

        if (!newSession) {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "PASSWORD_RECOVERY" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          setLoading(true);

          // Supabase database requests run outside the auth callback.
          setTimeout(async () => {
            if (!mounted || current !== requestId.current) return;

            try {
              await loadAccount(newSession.user.id);
            } catch (err) {
              setProfileError(
                err instanceof Error ? err.message : "Unable to load account.",
              );
            } finally {
              if (mounted && current === requestId.current) {
                setLoading(false);
              }
            }
          }, 0);
        } else {
          setLoading(false);
        }
      },
    );

    void loadSession();

    return () => {
      mounted = false;
      requestId.current++;
      listener.subscription.unsubscribe();
    };
  }, [loadAccount]);

  const clearPasswordRecovery = useCallback(() => {
    setPasswordRecovery(false);
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setPasswordRecovery(false);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isAdmin,
        loading,
        profileError,
        passwordRecovery,
        clearPasswordRecovery,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
