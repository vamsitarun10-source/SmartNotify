import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { subjects: any[]; overallPct: number };

export default function WeeklyAttendanceWidget({ subjects, overallPct }: Props) {
  const { theme: t } = useAppTheme();
  const color = overallPct >= 75 ? t.success : overallPct >= 70 ? t.warning : t.danger;

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.sm }}>
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Weekly Attendance</Text>
        <View style={{ backgroundColor: color + "20", borderRadius: t.radius.full, paddingHorizontal: t.spacing.sm, paddingVertical: 2 }}>
          <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.bold, color }}>{overallPct}%</Text>
        </View>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: t.surfaceVariant, overflow: "hidden", marginBottom: t.spacing.sm }}>
        <View style={{ height: "100%", width: `${Math.min(overallPct, 100)}%`, borderRadius: 4, backgroundColor: color }} />
      </View>
      {subjects.slice(0, 3).map((s) => (
        <View key={s.name} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
          <Text style={{ fontSize: t.font.sm, color: t.text, flex: 1 }} numberOfLines={1}>{s.name}</Text>
          <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{s.attended}/{s.attended + s.missed}</Text>
          <View style={{ width: 50, height: 4, borderRadius: 2, backgroundColor: t.surfaceVariant, marginLeft: 8, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${Math.min(s.pct, 100)}%`, borderRadius: 2, backgroundColor: s.pct >= 75 ? t.success : s.pct >= 70 ? t.warning : t.danger }} />
          </View>
        </View>
      ))}
    </View>
  );
}
