import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { supabase } from "../../lib/supabase";

function isAdult(dateString: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const birthDate = new Date(Date.UTC(year, month - 1, day));

  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== month - 1 ||
    birthDate.getUTCDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  return age >= 18 && age <= 120;
}

export default function CompleteProfileScreen() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [biography, setBiography] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!active) return;

      if (!data.user) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    }

    checkUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    setMessage("");

    if (!isAdult(dateOfBirth.trim())) {
      setMessage("Enter a valid date of birth. You must be at least 18.");
      return;
    }

    if (!/^[A-Za-z]{2}$/.test(countryCode.trim())) {
      setMessage("Enter a valid two-letter country code, such as UG.");
      return;
    }

    if (!city.trim() || !biography.trim()) {
      setMessage("Please complete all profile fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          date_of_birth: dateOfBirth.trim(),
          country_code: countryCode.trim().toUpperCase(),
          city: city.trim(),
          biography: biography.trim(),
        })
        .eq("user_id", data.user.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/");
    } catch {
      setMessage("Unable to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>

      <Text style={styles.subtitle}>
        Marriage Market is exclusively for adults aged 18 and above.
      </Text>

      <Text style={styles.label}>Date of birth</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <Text style={styles.label}>Country code</Text>
      <TextInput
        style={styles.input}
        placeholder="UG"
        maxLength={2}
        autoCapitalize="characters"
        value={countryCode}
        onChangeText={setCountryCode}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Kampala"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>About yourself</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Tell us about yourself..."
        multiline
        value={biography}
        onChangeText={setBiography}
      />

      {message ? <Text style={styles.error}>{message}</Text> : null}

      <Pressable style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save profile"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  error: {
    color: "#b42318",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
