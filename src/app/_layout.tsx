import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";

import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Marriage Market",
          }}
        />

        <Stack.Screen
          name="(auth)/register"
          options={{
            title: "Create Account",
          }}
        />

        <Stack.Screen
          name="(auth)/login"
          options={{
            title: "Sign In",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
