import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();

  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);
    setErrorMessage("");

    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Admin logout error:", error);
      setErrorMessage("Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Checking administrator permissions...</Text>
      </View>
    );
  }

  if (!user || !isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Administrator access required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Marriage Market Admin</Text>

      <Text style={styles.subtitle}>Account management dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Administrator account</Text>

        <Text style={styles.email}>{user.email}</Text>

        <Text style={styles.status}>Administrator authorization confirmed</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account review</Text>

        <Text style={styles.description}>
          Pending account reviews and approval controls will be added in the
          next stage.
        </Text>
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        style={styles.button}
        onPress={handleLogout}
        disabled={signingOut}
      >
        <Text style={styles.buttonText}>
          {signingOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 18,
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
  },

  card: {
    padding: 22,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    gap: 12,
  },

  label: {
    fontSize: 14,
    color: "#666",
  },

  email: {
    fontSize: 17,
    fontWeight: "600",
  },

  status: {
    color: "#167a42",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  description: {
    color: "#555",
    lineHeight: 23,
  },

  error: {
    color: "#b42318",
  },

  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
