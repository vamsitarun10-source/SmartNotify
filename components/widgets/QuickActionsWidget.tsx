import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Action = { icon: string; label: string; color: string; action: () => void };
type Props = { actions: Action[] };

export default function QuickActionsWidget({ actions }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: t.spacing.xs }}>
      {actions.map((qa) => (
        <TouchableOpacity
          key={qa.label}
          style={{ flex: 1, alignItems: "center", paddingVertical: t.spacing.md, borderRadius: t.radius.lg, backgroundColor: t.surfaceVariant, gap: 6 }}
          activeOpacity={0.7}
          onPress={qa.action}
          accessibilityLabel={qa.label}
          accessibilityRole="button"
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: qa.color + "20", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={qa.icon as any} size={20} color={qa.color} />
          </View>
          <Text style={{ fontSize: t.font.xs, fontWeight: t.font.weight.semibold, color: t.text }}>{qa.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
