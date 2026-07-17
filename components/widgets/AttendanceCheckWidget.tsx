import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type UnmarkedEvent = { id: string; title: string; date: string; time: string };
type Props = { events: UnmarkedEvent[]; onMark: (id: string, attended: boolean) => void; markedIds: Set<string> };

export default function AttendanceCheckWidget({ events, onMark, markedIds }: Props) {
  const { theme: t } = useAppTheme();
  const visible = events.filter((e) => !markedIds.has(e.id || ""));
  if (!visible.length) return null;

  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: t.warning }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: t.spacing.sm }}>
        <Ionicons name="help-circle" size={20} color={t.warning} />
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Attendance Check</Text>
      </View>
      {visible.map((e) => (
        <View key={e.id} style={{ backgroundColor: t.surfaceVariant, borderRadius: t.radius.md, padding: t.spacing.sm + 2, marginBottom: t.spacing.xs }}>
          <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>{e.title}</Text>
          <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginBottom: t.spacing.xs }}>{e.date} at {e.time}</Text>
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: t.successContainer, borderRadius: t.radius.md, paddingVertical: t.spacing.sm, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 }}
              onPress={() => onMark(e.id, true)}
              activeOpacity={0.7}
              accessibilityLabel={`Mark ${e.title} as attended`}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.success }}>Attended</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: t.dangerContainer, borderRadius: t.radius.md, paddingVertical: t.spacing.sm, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 }}
              onPress={() => onMark(e.id, false)}
              activeOpacity={0.7}
              accessibilityLabel={`Mark ${e.title} as missed`}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={16} color={t.danger} />
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.danger }}>Missed</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}
