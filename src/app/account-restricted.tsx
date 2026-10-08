import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

export default function AccountRestrictedScreen() {
  const { signOut } = useAuth();
  const [error, setError] = useState("");

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setError("Unable to sign out.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account access restricted</Text>

      <Text style={styles.description}>
        Your account is currently restricted. Matchmaking features are
        unavailable. Please contact support if you believe this is an error.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: "#555",
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
    fontSize: 16,
    fontWeight: "600",
  },
});
