import { router, usePathname } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, profile, isAdmin, loading, profileError } = useAuth();

  const pathname = usePathname();

  const isPublicRoute = pathname === "/login" || pathname === "/register";

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const profileComplete = Boolean(
    profile?.date_of_birth &&
    profile?.country_code &&
    profile?.city?.trim() &&
    profile?.biography?.trim(),
  );

  let destination: string | null = null;

  if (!loading && !profileError) {
    if (!session) {
      if (!isPublicRoute) {
        destination = "/login";
      }
    } else if (!profile) {
      // Keep access blocked until the profile is available.
    } else if (
      profile.account_status === "suspended" ||
      profile.account_status === "deleted"
    ) {
      if (pathname !== "/account-restricted") {
        destination = "/account-restricted";
      }
    } else if (isAdmin) {
      if (!isAdminRoute) {
        destination = "/admin";
      }
    } else if (isAdminRoute) {
      destination = profileComplete ? "/account-pending" : "/complete-profile";
    } else if (!profileComplete) {
      if (pathname !== "/complete-profile") {
        destination = "/complete-profile";
      }
    } else if (profile.account_status === "pending") {
      if (pathname !== "/account-pending" && pathname !== "/complete-profile") {
        destination = "/account-pending";
      }
    } else if (profile.account_status === "active") {
      if (
        isPublicRoute ||
        pathname === "/account-pending" ||
        pathname === "/account-restricted"
      ) {
        destination = "/";
      }
    }
  }

  useEffect(() => {
    if (destination) {
      router.replace(destination as any);
    }
  }, [destination]);

  if (loading || destination || (session && !profile && !profileError)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Checking account permissions...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Unable to verify account access:</Text>
        <Text>{profileError}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  error: {
    color: "#b42318",
    fontWeight: "600",
  },
});
