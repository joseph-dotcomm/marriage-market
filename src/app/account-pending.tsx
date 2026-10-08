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

export default function AccountPendingScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  async function checkStatus() {
    setChecking(true);
    setMessage("");

    try {
      await refreshProfile();
      setMessage("Account status refreshed.");
    } catch {
      setMessage("Unable to refresh account status.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setMessage("Unable to sign out.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account awaiting approval</Text>

      <Text style={styles.description}>
        Your profile has been submitted successfully. Marriage Market will
        review your account before matchmaking features become available.
      </Text>

      <Text style={styles.status}>
        Current status: {profile?.account_status ?? "pending"}
      </Text>

      {message ? <Text>{message}</Text> : null}

      <Pressable style={styles.button} onPress={checkStatus}>
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Refresh status</Text>
        )}
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleSignOut}>
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
  status: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#555",
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
