import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Marriage Market" }} />
        <Stack.Screen name="(auth)/login" options={{ title: "Sign In" }} />
        <Stack.Screen
          name="(auth)/register"
          options={{ title: "Create Account" }}
        />
        <Stack.Screen
          name="complete-profile"
          options={{ title: "Complete Profile" }}
        />
        <Stack.Screen
          name="account-pending"
          options={{ title: "Account Pending" }}
        />
        <Stack.Screen
          name="account-restricted"
          options={{ title: "Account Restricted" }}
        />
        <Stack.Screen
          name="admin/index"
          options={{ title: "Marriage Market Admin" }}
        />
      </Stack>
    </AuthProvider>
  );
}
