import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";
export default function HomeScreen() {
  const router = useRouter();

  const {
    user,
    profile,
    isAdmin,
    loading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileComplete = Boolean(
    profile?.date_of_birth &&
    profile?.country_code &&
    profile?.city?.trim() &&
    profile?.biography?.trim(),
  );

  useEffect(() => {
    if (loading || profileError) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!profile) return;

    if (
      profile.account_status === "suspended" ||
      profile.account_status === "deleted"
    ) {
      router.replace("/account-restricted");
      return;
    }

    if (isAdmin) {
      router.replace("/admin");
      return;
    }

    if (!profileComplete) {
      router.replace("/complete-profile");
      return;
    }

    if (profile.account_status === "pending") {
      router.replace("/account-pending");
    }
  }, [user, profile, isAdmin, loading, profileError, profileComplete, router]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);

    try {
      await refreshProfile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to refresh your profile.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.");
    }
  }

  if (loading || (user && !profile && !profileError)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Checking account access...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Unable to verify account access.</Text>
        <Text>{profileError}</Text>
        <Pressable
          style={styles.button}
          onPress={() => void handleRefresh()}
          disabled={refreshing}
        >
          <Text style={styles.buttonText}>
            {refreshing ? "Retrying..." : "Retry"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (
    !user ||
    !profile ||
    isAdmin ||
    !profileComplete ||
    profile.account_status !== "active"
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Redirecting to your account page...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Marriage Market</Text>

      <Text style={styles.subtitle}>
        Your journey toward a meaningful relationship starts here.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Account</Text>

        <Text>Name: {profile.display_name || "Member"}</Text>

        <Text>Email: {user.email}</Text>

        <Text>Country: {profile.country_code}</Text>

        <Text>City: {profile.city}</Text>

        <Text style={styles.active}>Account Status: Active</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Matchmaking</Text>

        <Text style={styles.description}>
          Your account has been approved. Match discovery, compatibility
          recommendations, and communication features will be added in the next
          development stage.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Profile</Text>

        <Text>{profile.biography || "No biography provided."}</Text>
      </View>

      {Boolean(error) && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={styles.button}
        onPress={() => void handleRefresh()}
        disabled={refreshing}
      >
        <Text style={styles.buttonText}>
          {refreshing ? "Refreshing..." : "Refresh Profile"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.signOutButton}
        onPress={() => void handleSignOut()}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F5F7FB",
    gap: 18,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 16,
    color: "#475467",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  description: {
    color: "#475467",
    lineHeight: 24,
  },

  active: {
    color: "#067647",
    fontWeight: "700",
  },

  error: {
    color: "#B42318",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#175CD3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  signOutButton: {
    backgroundColor: "#667085",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
