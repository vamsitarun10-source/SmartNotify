import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { periods: any[]; count: number };

export default function FreeTimeWidget({ periods, count }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.xs }}>
        <Ionicons name="time-outline" size={18} color={t.success} />
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>{count} Free Period{count !== 1 ? "s" : ""}</Text>
      </View>
      {count > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs }}>
          {periods.slice(0, 4).map((p, i) => (
            <View key={i} style={{ backgroundColor: t.successContainer, borderRadius: t.radius.sm, paddingHorizontal: t.spacing.sm, paddingVertical: 4 }}>
              <Text style={{ fontSize: t.font.xs, fontWeight: t.font.weight.semibold, color: t.success }}>{p.start}-{p.end}</Text>
            </View>
          ))}
          {periods.length > 4 ? <Text style={{ fontSize: t.font.xs, color: t.textTertiary, alignSelf: "center" }}>+{periods.length - 4} more</Text> : null}
        </View>
      ) : (
        <Text style={{ fontSize: t.font.sm, color: t.textTertiary }}>Your schedule is fully packed today</Text>
      )}
    </View>
  );
}
