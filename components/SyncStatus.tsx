import React, { useEffect, useState, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { getQueueLength, onQueueChange } from "../services/syncQueue";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function SyncStatus() {
  const { theme: t } = useAppTheme();
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getQueueLength().then(setQueueCount);
    const unsub = onQueueChange(() => { getQueueLength().then(setQueueCount); });
    return unsub;
  }, []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: queueCount > 0 || !isOnline ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [queueCount, isOnline]);

  if (queueCount === 0 && isOnline) return null;

  const status = !isOnline
    ? { icon: "cloud-offline", text: "Offline", color: t.warning }
    : queueCount > 0
    ? { icon: "sync", text: `${queueCount} pending`, color: t.info }
    : { icon: "cloud-done", text: "Synced", color: t.success };

  return (
    <Animated.View style={[styles.container, { backgroundColor: status.color, opacity }]}>
      <Ionicons name={status.icon as any} size={14} color="#fff" />
      <Text style={styles.text}>{status.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: "600", color: "#fff" },
});
