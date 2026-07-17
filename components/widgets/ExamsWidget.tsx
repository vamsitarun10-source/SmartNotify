import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { exams: any[] };

export default function ExamsWidget({ exams }: Props) {
  const { theme: t } = useAppTheme();
  if (!exams.length) {
    return <Text style={{ fontSize: t.font.sm, color: t.textTertiary, textAlign: "center", paddingVertical: t.spacing.sm }}>No exams this week</Text>;
  }
  const typeColors: Record<string, string> = { internal: t.info, mid: t.warning, semester: t.danger, practical: t.secondary };
  return (
    <View>
      {exams.slice(0, 3).map((e) => {
        const c = typeColors[e.exam_type] || t.primary;
        return (
          <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingVertical: 6 }}>
            <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: c }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>{e.title}</Text>
              <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{e.date} at {e.time} — {e.exam_type}</Text>
            </View>
            {e.location ? <Ionicons name="location-outline" size={14} color={t.textTertiary} /> : null}
          </View>
        );
      })}
    </View>
  );
}
