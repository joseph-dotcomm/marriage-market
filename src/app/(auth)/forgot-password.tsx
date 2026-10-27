import { Link } from "expo-router";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();

    setErrorMessage("");
    setMessage("");

    if (!normalizedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: "http://localhost:8081/reset-password",
        },
      );

      if (error) {
        throw error;
      }

      setMessage(
        "If an account exists with this email address, " +
          "a password reset link will be sent. " +
          "Please check your inbox and spam folder.",
      );
    } catch (error) {
      console.error("PASSWORD RESET ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Marriage Market</Text>

      <Text style={styles.title}>Forgot Password?</Text>

      <Text style={styles.subtitle}>
        Enter the email address associated with your Marriage Market account. We
        will send you instructions to reset your password.
      </Text>

      <Text style={styles.label}>Email Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your registered email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      {Boolean(errorMessage) && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}

      {Boolean(message) && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={() => void handlePasswordReset()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Send Password Reset Link</Text>
        )}
      </Pressable>

      <Text style={styles.footer}>
        Remember your password?{" "}
        <Link href="/login" style={styles.link}>
          Sign In
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
    backgroundColor: "#FFFFFF",
  },

  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#175CD3",
    marginBottom: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#101828",
  },

  subtitle: {
    fontSize: 15,
    color: "#475467",
    lineHeight: 23,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  button: {
    backgroundColor: "#175CD3",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  error: {
    color: "#B42318",
    fontSize: 14,
  },

  successBox: {
    backgroundColor: "#ECFDF3",
    borderRadius: 8,
    padding: 14,
  },

  successText: {
    color: "#067647",
    fontSize: 14,
    lineHeight: 21,
  },

  footer: {
    textAlign: "center",
    marginTop: 18,
    color: "#475467",
  },

  link: {
    color: "#175CD3",
    fontWeight: "700",
  },
});
