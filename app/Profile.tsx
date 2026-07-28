import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import {
  testImmediateNotification,
  testScheduledNotification,
  listScheduledNotifications,
  checkNotificationPermissions,
} from "../services/notifications";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { theme: t } = useAppTheme();
  const [testing, setTesting] = useState(false);

  const onLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Profile" />
      <View style={{ flex: 1, alignItems: "center", paddingTop: t.spacing.xl, paddingBottom: 60 + insets.bottom + 16 }}>
        <View style={{
          width: 96, height: 96, borderRadius: 48,
          backgroundColor: t.primaryContainer,
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="person" size={48} color={t.primary} />
        </View>
        <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold as any, color: t.text, marginTop: t.spacing.md }}>
          {user?.name || "User"}
        </Text>
        <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.xs }}>
          {user?.email || ""}
        </Text>

        {/* Settings */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
            width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xl,
            backgroundColor: t.surface, borderRadius: t.radius.md,
            paddingVertical: t.spacing.sm + 4,
          }}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.7}
          accessibilityLabel="Open settings"
          accessibilityHint="Customize app appearance and notifications"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={20} color={t.primary} />
          <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>Settings</Text>
          <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
        </TouchableOpacity>

        {/* Backup */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
            width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.sm,
            backgroundColor: t.surface, borderRadius: t.radius.md,
            paddingVertical: t.spacing.sm + 4,
          }}
          onPress={() => navigation.navigate("Backup")}
          activeOpacity={0.7}
          accessibilityLabel="Backup and restore"
          accessibilityHint="Export or import your data"
          accessibilityRole="button"
        >
          <Ionicons name="cloud-upload-outline" size={20} color={t.secondary} />
          <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>Backup & Restore</Text>
          <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
        </TouchableOpacity>

        {/* DEBUG: Notification Testing (dev only) */}
        {__DEV__ && (
          <>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
              width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.lg,
            }}>
              <Ionicons name="bug-outline" size={16} color={t.textTertiary} />
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold as any, color: t.textTertiary }}>
                DEBUG — Notification Test
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
                width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.sm,
                backgroundColor: t.surface, borderRadius: t.radius.md,
                paddingVertical: t.spacing.sm + 4,
              }}
              onPress={async () => {
                setTesting(true);
                try {
                  const id = await testImmediateNotification();
                  Alert.alert("Immediate Test", id ? `Notification sent (${id})` : "Failed to send");
                } catch (e: any) {
                  Alert.alert("Error", e?.message || "Notification failed");
                }
                setTesting(false);
              }}
              disabled={testing}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color={t.warning} />
              <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>
                {testing ? "Sending..." : "Test Immediate Notification"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
                width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xs,
                backgroundColor: t.surface, borderRadius: t.radius.md,
                paddingVertical: t.spacing.sm + 4,
              }}
              onPress={async () => {
                setTesting(true);
                try {
                  const id = await testScheduledNotification();
                  Alert.alert("Scheduled Test", id ? `Notification in 60s (${id})` : "Failed");
                } catch (e: any) {
                  Alert.alert("Error", e?.message || "Scheduling failed");
                }
                setTesting(false);
              }}
              disabled={testing}
              activeOpacity={0.7}
            >
              <Ionicons name="timer-outline" size={20} color={t.secondary} />
              <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>
                {testing ? "Scheduling..." : "Test Scheduled (60s)"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
                width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xs,
                backgroundColor: t.surface, borderRadius: t.radius.md,
                paddingVertical: t.spacing.sm + 4,
              }}
              onPress={async () => {
                const ids = await listScheduledNotifications();
                Alert.alert("Scheduled IDs", ids.length > 0 ? ids.join("\n") : "No scheduled notifications");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={20} color={t.info} />
              <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>
                List Scheduled Notifications
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
                width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xs,
                backgroundColor: t.surface, borderRadius: t.radius.md,
                paddingVertical: t.spacing.sm + 4,
              }}
              onPress={async () => {
                const settings = await checkNotificationPermissions();
                Alert.alert("Permission Settings", JSON.stringify(settings, null, 2));
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={t.success} />
              <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>
                Check Notification Permissions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
                width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xs,
                backgroundColor: t.surface, borderRadius: t.radius.md,
                paddingVertical: t.spacing.sm + 4,
              }}
              onPress={() => navigation.navigate("DebugConsole")}
              activeOpacity={0.7}
            >
              <Ionicons name="terminal-outline" size={20} color={t.primary} />
              <Text style={{ flex: 1, fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text }}>
                Open Debug Console
              </Text>
              <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
            </TouchableOpacity>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={{
            flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
            width: "100%", paddingHorizontal: t.spacing.xl, marginTop: t.spacing.xl,
            backgroundColor: t.dangerContainer, borderRadius: t.radius.md,
            paddingVertical: t.spacing.sm + 4,
          }}
          onPress={onLogout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
          accessibilityHint="Sign out of your account"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={t.danger} />
          <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.bold as any, color: t.danger, marginLeft: t.spacing.sm }}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
