import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";

type StatItem = {
  icon: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  items: StatItem[];
};

export default function StatRow({ items }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: t.spacing.md,
            borderRadius: t.radius.lg,
            backgroundColor: item.color + "12",
          }}
        >
          <Ionicons name={item.icon as any} size={18} color={item.color} />
          <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: item.color, marginTop: 4 }}>
            {item.value}
          </Text>
          <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
