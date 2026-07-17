import React from "react";
import { View, Text } from "react-native";
import { useAppTheme } from "../constants/ThemeContext";

type Props = {
  label: string;
  children: React.ReactNode;
  style?: any;
};

export default function FormField({ label, children, style }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={{ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary, marginBottom: 6 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
