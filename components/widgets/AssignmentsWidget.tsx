import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { assignments: any[] };

export default function AssignmentsWidget({ assignments }: Props) {
  const { theme: t } = useAppTheme();
  if (!assignments.length) {
    return <Text style={{ fontSize: t.font.sm, color: t.textTertiary, textAlign: "center", paddingVertical: t.spacing.sm }}>No upcoming assignments</Text>;
  }
  const pColors: Record<string, string> = { low: t.success, medium: t.warning, high: t.danger };
  return (
    <View>
      {assignments.slice(0, 4).map((a) => {
        const pc = pColors[a.priority] || t.warning;
        const isOverdue = a.due_date < new Date().toISOString().slice(0, 10);
        return (
          <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingVertical: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isOverdue ? t.danger : pc }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>{a.title}</Text>
              <Text style={{ fontSize: t.font.xs, color: isOverdue ? t.danger : t.textSecondary }}>Due {a.due_date}{a.subject ? ` — ${a.subject}` : ""}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
