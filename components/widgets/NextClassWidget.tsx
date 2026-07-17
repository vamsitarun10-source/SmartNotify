import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { nextEvent: any; countdown: string };

export default function NextClassWidget({ nextEvent, countdown }: Props) {
  const { theme: t } = useAppTheme();
  if (!nextEvent) {
    return (
      <View style={{ paddingVertical: t.spacing.md, alignItems: "center" }}>
        <Ionicons name="checkmark-circle-outline" size={28} color={t.success} />
        <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: 4 }}>No upcoming classes</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: t.primaryContainer, borderRadius: t.radius.md, padding: t.spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.semibold, color: t.onPrimaryContainer }}>{nextEvent.title}</Text>
        {nextEvent.subject ? <Text style={{ fontSize: t.font.sm, color: t.primary, marginTop: 2 }}>{nextEvent.subject}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
          <Ionicons name="calendar-outline" size={13} color={t.onPrimaryContainer} />
          <Text style={{ fontSize: t.font.sm, color: t.onPrimaryContainer }}>{nextEvent.date}</Text>
          <Ionicons name="time-outline" size={13} color={t.onPrimaryContainer} />
          <Text style={{ fontSize: t.font.sm, color: t.onPrimaryContainer }}>{nextEvent.time}</Text>
        </View>
      </View>
      {countdown ? (
        <View style={{ backgroundColor: t.primary, borderRadius: t.radius.md, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, alignItems: "center" }}>
          <Text style={{ fontSize: t.font.xs, color: t.onPrimary, fontWeight: t.font.weight.medium }}>in</Text>
          <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.onPrimary }}>{countdown}</Text>
        </View>
      ) : null}
    </View>
  );
}
