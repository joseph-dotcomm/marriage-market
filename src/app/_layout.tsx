import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: "Back",
          contentStyle: {
            backgroundColor: "#F5F7FB",
          },
        }}
      >
        {/* Main application dashboard */}
        <Stack.Screen
          name="index"
          options={{
            title: "Marriage Market",
          }}
        />

        {/* Authentication: Sign In */}
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: "Sign In",
          }}
        />

        {/* Authentication: Registration */}
        <Stack.Screen
          name="(auth)/register"
          options={{
            title: "Create Account",
          }}
        />

        {/* Authentication: Forgot Password */}
        <Stack.Screen
          name="(auth)/forgot-password"
          options={{
            title: "Password Recovery",
          }}
        />

        {/* Authentication: Set New Password */}
        <Stack.Screen
          name="reset-password"
          options={{
            title: "Set New Password",
          }}
        />

        {/* User profile completion */}
        <Stack.Screen
          name="complete-profile"
          options={{
            title: "Complete Profile",
          }}
        />

        {/* Pending account approval */}
        <Stack.Screen
          name="account-pending"
          options={{
            title: "Account Pending Approval",
          }}
        />

        {/* Suspended or restricted accounts */}
        <Stack.Screen
          name="account-restricted"
          options={{
            title: "Account Restricted",
          }}
        />

        {/* Administrator dashboard */}
        <Stack.Screen
          name="admin/index"
          options={{
            title: "Marriage Market Admin",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
