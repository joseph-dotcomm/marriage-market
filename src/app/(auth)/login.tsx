import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("LOGIN ERROR:", error.message);
        Alert.alert("Sign in failed", error.message);
        return;
      }

      console.log("LOGIN SUCCESS:", data.user?.email);
      console.log("SESSION EXISTS:", !!data.session);

      router.replace("/");
    } catch (error) {
      console.error(error);

      Alert.alert("Unexpected error", "Sign in could not be completed.");
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
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Sign in"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Don't have an account?{" "}
        <Link href="/(auth)/register" style={styles.link}>
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
    borderColor: "#cccccc",
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  footer: {
    textAlign: "center",
    marginTop: 12,
  },

  link: {
    fontWeight: "700",
  },
});
