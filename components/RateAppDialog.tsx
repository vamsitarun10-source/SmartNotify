import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../constants/ThemeContext";
import { PLAY_STORE_URL } from "../constants/appInfo";
import { Linking } from "react-native";

const LAUNCH_COUNT_KEY = "app_launch_count";
const RATE_SHOWN_KEY = "rate_dialog_shown";
const RATE_INTERVAL = 3;

export async function incrementLaunchCount(): Promise<number> {
  const raw = await AsyncStorage.getItem(LAUNCH_COUNT_KEY);
  const count = (raw ? parseInt(raw) : 0) + 1;
  await AsyncStorage.setItem(LAUNCH_COUNT_KEY, String(count));
  return count;
}

export async function shouldShowRateDialog(): Promise<boolean> {
  const shown = await AsyncStorage.getItem(RATE_SHOWN_KEY);
  if (shown === "true") return false;
  const raw = await AsyncStorage.getItem(LAUNCH_COUNT_KEY);
  const count = raw ? parseInt(raw) : 0;
  return count >= RATE_INTERVAL && count % RATE_INTERVAL === 0;
}

export async function dismissRateDialog() {
  await AsyncStorage.setItem(RATE_SHOWN_KEY, "true");
}

export default function RateAppDialog() {
  const { theme: t } = useAppTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    shouldShowRateDialog().then(setVisible);
  }, []);

  const onRate = () => {
    Linking.openURL(PLAY_STORE_URL);
    dismissRateDialog();
    setVisible(false);
  };

  const onDismiss = () => {
    dismissRateDialog();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <Ionicons name="star" size={48} color="#FFD700" />
          <Text style={[styles.title, { color: t.text }]}>Enjoying ClassReminder?</Text>
          <Text style={[styles.message, { color: t.textSecondary }]}>If you're finding the app useful, please take a moment to rate us on the Play Store!</Text>

          <TouchableOpacity style={[styles.rateBtn, { backgroundColor: t.primary }]} onPress={onRate} activeOpacity={0.8}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={[styles.rateBtnText]}>Rate 5 Stars</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary }}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  dialog: { borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1, width: "100%", maxWidth: 340 },
  title: { fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  rateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: "100%" },
  rateBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dismissBtn: { marginTop: 12, paddingVertical: 8 },
});
