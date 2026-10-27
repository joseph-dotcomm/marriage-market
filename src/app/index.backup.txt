import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../contexts/AuthContext";

type PendingAccount = {
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  country_code: string | null;
  city: string | null;
  biography: string | null;
};

type ReviewStatus = "active" | "suspended";

type Confirmation = {
  accountId: string;
  accountName: string;
  status: ReviewStatus;
  reason: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const { user, isAdmin, loading, profileError, signOut } = useAuth();

  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // Retrieve pending applications.
  const loadPendingAccounts = useCallback(async () => {
    if (!user || !isAdmin) return;

    setFetching(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_pending_accounts",
      );

      if (rpcError) throw rpcError;

      setAccounts((data ?? []) as PendingAccount[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to retrieve pending accounts.",
      );
    } finally {
      setFetching(false);
    }
  }, [user?.id, isAdmin]);

  // Load applications after administrator verification.
  useEffect(() => {
    if (user && isAdmin && !loading && !profileError) {
      void loadPendingAccounts();
    }
  }, [user?.id, isAdmin, loading, profileError, loadPendingAccounts]);

  // Prepare a decision without changing the database.
  function prepareReview(account: PendingAccount, status: ReviewStatus) {
    if (!user || !isAdmin || processing) return;

    if (account.user_id === user.id) {
      setError("Administrators cannot review their own accounts.");
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please provide a reason for your decision.");
      return;
    }

    setError(null);
    setNotice("");

    setConfirmation({
      accountId: account.user_id,
      accountName: account.display_name || "Unnamed applicant",
      status,
      reason: trimmedReason,
    });
  }

  // Execute the confirmed decision.
  async function submitReview() {
    if (!confirmation || processing || !user || !isAdmin) return;

    const decision = confirmation;

    if (decision.accountId === user.id) {
      setError("Administrators cannot review their own accounts.");
      setConfirmation(null);
      return;
    }

    setProcessing(true);
    setError(null);
    setNotice("");

    try {
      const { error: rpcError } = await supabase.rpc("review_user_account", {
        target_user: decision.accountId,
        new_account_status: decision.status,
        review_reason: decision.reason,
      });

      if (rpcError) throw rpcError;

      setConfirmation(null);
      setSelectedUser(null);
      setReason("");

      setNotice(
        decision.status === "active"
          ? "Account approved successfully."
          : "Account suspended successfully.",
      );

      await loadPendingAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account review failed.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSignOut() {
    if (processing) return;

    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed.");
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Verifying administrator access...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Unable to verify administrator access.</Text>
        <Text>{profileError}</Text>
      </View>
    );
  }

  if (!user || !isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Administrator access required.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Marriage Market Admin</Text>

      <Text style={styles.subtitle}>Account management dashboard</Text>

      <Text>Signed in as: {user.email}</Text>

      <Text style={styles.success}>Administrator authorization confirmed.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Account Applications</Text>

        <Text>
          Applications awaiting administrator review: {accounts.length}
        </Text>

        <Pressable
          style={styles.refreshButton}
          disabled={fetching || processing}
          onPress={() => {
            void loadPendingAccounts();
          }}
        >
          <Text style={styles.buttonText}>
            {fetching ? "Refreshing..." : "Refresh Applications"}
          </Text>
        </Pressable>

        {fetching && <ActivityIndicator size="small" />}

        {Boolean(error) && <Text style={styles.error}>{error}</Text>}

        {Boolean(notice) && <Text style={styles.success}>{notice}</Text>}

        {!fetching && !error && accounts.length === 0 && (
          <Text>No pending applications found.</Text>
        )}

        {accounts.map((account) => {
          const isSelf = account.user_id === user.id;
          const isSelected = selectedUser === account.user_id;

          return (
            <View key={account.user_id} style={styles.accountCard}>
              <Text style={styles.accountName}>
                {account.display_name || "Unnamed applicant"}
              </Text>

              <Text>Country: {account.country_code || "Not provided"}</Text>

              <Text>City: {account.city || "Not provided"}</Text>

              <Text>
                Date of birth: {account.date_of_birth || "Not provided"}
              </Text>

              <Text>Biography: {account.biography || "Not provided"}</Text>

              {isSelf ? (
                <Text style={styles.warning}>
                  This is your administrator account. Self-review is not
                  permitted.
                </Text>
              ) : isSelected ? (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Reason for decision</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Enter review reason"
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    editable={!processing && !confirmation}
                  />

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionButton, styles.approveButton]}
                      disabled={processing || confirmation !== null}
                      onPress={() => prepareReview(account, "active")}
                    >
                      <Text style={styles.buttonText}>Approve</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.actionButton, styles.suspendButton]}
                      disabled={processing || confirmation !== null}
                      onPress={() => prepareReview(account, "suspended")}
                    >
                      <Text style={styles.buttonText}>Suspend</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    disabled={processing || confirmation !== null}
                    onPress={() => {
                      setSelectedUser(null);
                      setReason("");
                      setError(null);
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.reviewButton}
                  disabled={processing || confirmation !== null}
                  onPress={() => {
                    setSelectedUser(account.user_id);
                    setReason("");
                    setError(null);
                    setNotice("");
                  }}
                >
                  <Text style={styles.buttonText}>Review Application</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {confirmation !== null && (
        <View style={styles.confirmationPanel}>
          <Text style={styles.confirmationTitle}>Confirm Account Decision</Text>

          <Text>Applicant: {confirmation.accountName}</Text>

          <Text>
            Action:{" "}
            {confirmation.status === "active"
              ? "Approve account"
              : "Suspend account"}
          </Text>

          <Text style={styles.reviewLabel}>Review reason</Text>

          <Text style={styles.confirmationReason}>{confirmation.reason}</Text>

          <Text style={styles.warning}>
            Confirming this decision will update the account status and create
            an audit record.
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              disabled={processing}
              onPress={() => setConfirmation(null)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                confirmation.status === "active"
                  ? styles.approveButton
                  : styles.suspendButton,
              ]}
              disabled={processing}
              onPress={() => {
                void submitReview();
              }}
            >
              <Text style={styles.buttonText}>
                {processing ? "Processing..." : "Confirm Decision"}
              </Text>
            </Pressable>
          </View>

          {processing && <ActivityIndicator size="small" />}
        </View>
      )}

      <Pressable
        style={styles.signOutButton}
        disabled={processing}
        onPress={() => {
          void handleSignOut();
        }}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F5F7FB",
    gap: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 17,
    color: "#475467",
  },

  success: {
    color: "#067647",
    fontWeight: "600",
  },

  error: {
    color: "#B42318",
    fontWeight: "600",
  },

  warning: {
    color: "#B54708",
    fontWeight: "600",
    marginTop: 8,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    gap: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  refreshButton: {
    backgroundColor: "#175CD3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  accountCard: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    padding: 16,
    gap: 8,
  },

  accountName: {
    fontSize: 18,
    fontWeight: "700",
  },

  reviewButton: {
    backgroundColor: "#175CD3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  reviewSection: {
    gap: 12,
    marginTop: 12,
  },

  reviewLabel: {
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },

  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  approveButton: {
    backgroundColor: "#067647",
  },

  suspendButton: {
    backgroundColor: "#B42318",
  },

  cancelButton: {
    backgroundColor: "#667085",
  },

  cancelText: {
    color: "#475467",
    textAlign: "center",
    padding: 8,
  },

  confirmationPanel: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderRadius: 12,
    padding: 20,
    gap: 14,
    marginTop: 16,
  },

  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9A3412",
  },

  confirmationReason: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  signOutButton: {
    backgroundColor: "#175CD3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
