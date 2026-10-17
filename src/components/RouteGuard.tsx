import { usePathname, useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

import { useAuth } from "../contexts/AuthContext";

export default function RouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();

  const { session, profile, isAdmin, loading, profileError } = useAuth();

  const destination = useMemo(() => {
    if (loading || profileError) return null;

    const publicRoute = pathname === "/login" || pathname === "/register";

    const adminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

    if (!session) {
      return publicRoute ? null : "/login";
    }

    if (!profile) {
      return null;
    }

    if (
      profile.account_status === "suspended" ||
      profile.account_status === "deleted"
    ) {
      return pathname === "/account-restricted" ? null : "/account-restricted";
    }

    if (isAdmin) {
      return adminRoute ? null : "/admin";
    }

    const profileComplete = Boolean(
      profile.date_of_birth &&
      profile.country_code &&
      profile.city?.trim() &&
      profile.biography?.trim(),
    );

    if (!profileComplete) {
      return pathname === "/complete-profile" ? null : "/complete-profile";
    }

    if (profile.account_status === "pending") {
      return pathname === "/account-pending" ? null : "/account-pending";
    }

    if (profile.account_status === "active") {
      if (
        publicRoute ||
        adminRoute ||
        pathname === "/account-pending" ||
        pathname === "/complete-profile" ||
        pathname === "/account-restricted"
      ) {
        return "/";
      }
    }

    return null;
  }, [loading, profileError, pathname, session, profile, isAdmin]);

  useEffect(() => {
    if (!navigationState?.key || !destination) return;

    if (pathname !== destination) {
      router.replace(destination as any);
    }
  }, [navigationState?.key, destination, pathname, router]);

  return null;
}
