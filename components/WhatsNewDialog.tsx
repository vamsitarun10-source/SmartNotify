import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../constants/ThemeContext";
import { APP_VERSION } from "../constants/appInfo";

const VERSION_KEY = "last_seen_version";

const CHANGES = [
  { version: "1.0.0", items: [
    "AI-powered scheduling assistant",
    "Smart reminders with snooze",
    "Attendance tracking",
    "Task & assignment management",
    "Exam planner with countdowns",
    "Notes with offline support",
    "Beautiful Material Design UI",
    "Dark mode and AMOLED theme",
    "Backup & restore",
    "Productivity rewards system",
  ]},
];

export async function checkVersionUpgrade(): Promise<boolean> {
  const lastSeen = await AsyncStorage.getItem(VERSION_KEY);
  if (lastSeen !== APP_VERSION) {
    return true;
  }
  return false;
}

export async function markVersionSeen() {
  await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
}

export default function WhatsNewDialog() {
  const { theme: t } = useAppTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkVersionUpgrade().then((show) => {
      if (show) setVisible(true);
    });
  }, []);

  const onDismiss = () => {
    markVersionSeen();
    setVisible(false);
  };

  if (!visible) return null;

  const currentChanges = CHANGES.find((c) => c.version === APP_VERSION) || CHANGES[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: t.primaryContainer }]}>
            <Ionicons name="sparkles" size={32} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>What's New</Text>
          <Text style={[styles.version, { color: t.textSecondary }]}>Version {APP_VERSION}</Text>

          <View style={{ width: "100%", marginTop: 16 }}>
            {currentChanges.items.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color={t.success} style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 14, color: t.text, flex: 1, lineHeight: 20 }}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[styles.okBtn, { backgroundColor: t.primary }]} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  dialog: { borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1, width: "100%", maxWidth: 360 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 16 },
  version: { fontSize: 14, marginTop: 4 },
  okBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginTop: 20, width: "100%", alignItems: "center" },
});
