import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../../../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace("/");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Marriage Market</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={() => void handleLogin()}
      />

      {Boolean(errorMessage) && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}

      <Pressable
        style={styles.button}
        onPress={() => void handleLogin()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>

      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Link href="/register" style={styles.link}>
          Create account
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#B42318",
  },
  footer: {
    textAlign: "center",
    marginTop: 12,
  },
  link: {
    fontWeight: "700",
    color: "#175CD3",
    textAlign: "center",
  },
});
