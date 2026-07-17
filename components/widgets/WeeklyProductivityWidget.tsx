import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { productivity: any };

export default function WeeklyProductivityWidget({ productivity }: Props) {
  const { theme: t } = useAppTheme();
  const { tasks_completed, tasks_total, assignments_completed, assignments_total } = productivity;
  const taskPct = tasks_total > 0 ? Math.round(tasks_completed / tasks_total * 100) : 0;
  const assignPct = assignments_total > 0 ? Math.round(assignments_completed / assignments_total * 100) : 0;

  return (
    <View>
      <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Weekly Productivity</Text>
      <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
        <View style={{ flex: 1, backgroundColor: t.primaryContainer, borderRadius: t.radius.md, padding: t.spacing.sm + 2, alignItems: "center" }}>
          <Ionicons name="checkbox" size={18} color={t.primary} />
          <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.primary, marginTop: 4 }}>{taskPct}%</Text>
          <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>{tasks_completed}/{tasks_total} tasks</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: t.warningContainer, borderRadius: t.radius.md, padding: t.spacing.sm + 2, alignItems: "center" }}>
          <Ionicons name="document-text" size={18} color={t.warning} />
          <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.warning, marginTop: 4 }}>{assignPct}%</Text>
          <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>{assignments_completed}/{assignments_total} assignments</Text>
        </View>
      </View>
    </View>
  );
}
