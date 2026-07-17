import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppTheme } from "../constants/ThemeContext";

type FilterItem = { key: string; label: string };

type Props = {
  filters: FilterItem[];
  selected: string;
  onSelect: (key: string) => void;
};

export default function FilterBar({ filters, selected, onSelect }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
      {filters.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[chipStyle(t), selected === f.key && chipActive(t)]}
          onPress={() => onSelect(f.key)}
          activeOpacity={0.7}
          accessibilityLabel={`Filter by ${f.label}`}
          accessibilityState={{ selected: selected === f.key }}
          accessibilityRole="button"
        >
          <Text style={[chipTextStyle(t), selected === f.key && chipTextActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const chipStyle = (t: any) => ({
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: t.radius.full,
  borderWidth: 1,
  borderColor: t.border,
  backgroundColor: t.surface,
});
const chipActive = (t: any) => ({
  backgroundColor: t.primary,
  borderColor: t.primary,
});
const chipTextStyle = (t: any) => ({
  fontSize: t.font.sm,
  fontWeight: "600" as const,
  color: t.textSecondary,
});
const chipTextActive = {
  color: "#fff",
};
