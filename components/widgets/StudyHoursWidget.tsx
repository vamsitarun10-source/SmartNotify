import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { hours: number };

export default function StudyHoursWidget({ hours }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.info + "20", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="book" size={20} color={t.info} />
        </View>
        <View>
          <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.text }}>{hours}h</Text>
          <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>Study Hours</Text>
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>this week</Text>
      </View>
    </View>
  );
}
