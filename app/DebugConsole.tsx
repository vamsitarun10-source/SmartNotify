import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../constants/ThemeContext";
import { debugLogger } from "../services/DebugLogger";
import Header from "../components/Header";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function DebugConsoleScreen() {
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const [logs, setLogs] = useState(debugLogger.getLogs());
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsub = debugLogger.subscribe(() => {
      setLogs([...debugLogger.getLogs()]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (autoScroll && logs.length > 0) {
      // Small delay to let the scroll view render
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = debugLogger.getLogText();
    Clipboard.setString(text);
    Alert.alert("Copied", "Logs copied to clipboard.");
  };

  const handleClear = () => {
    debugLogger.clear();
    setLogs([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Debug Console" showBack />
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: t.primary,
            borderRadius: 8,
            paddingVertical: 10,
          }}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={16} color={t.onPrimary} />
          <Text style={{ color: t.onPrimary, fontWeight: "600", fontSize: 14 }}>
            Copy Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: t.danger,
            borderRadius: 8,
            paddingVertical: 10,
          }}
          onPress={handleClear}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            Clear
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: autoScroll ? t.secondary : t.surfaceVariant,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
          onPress={() => setAutoScroll(!autoScroll)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={autoScroll ? "lock-open" : "lock-closed"}
            size={16}
            color={autoScroll ? "#fff" : t.text}
          />
          <Text style={{ color: autoScroll ? "#fff" : t.text, fontWeight: "600", fontSize: 13 }}>
            Auto
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {logs.length === 0 ? (
          <Text style={{ color: t.textSecondary, textAlign: "center", marginTop: 40, fontSize: 14 }}>
            No logs yet. Create a class or tap "Test Immediate Notification" on the Profile screen.
          </Text>
        ) : (
          logs.map((entry, i) => (
            <View
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? t.surface : "transparent",
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 11, color: t.textTertiary, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>
                [{entry.timestamp}]
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: entry.message.includes("FAILED") || entry.message.includes("Error")
                    ? t.danger
                    : entry.message.includes("SUCCESS")
                    ? t.success
                    : t.text,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                }}
              >
                {entry.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
