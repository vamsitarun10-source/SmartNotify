import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../constants/ThemeContext";
import { PRIVACY_POLICY } from "../constants/appInfo";
import Header from "../components/Header";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const sections = PRIVACY_POLICY.split("\n\n");

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Privacy Policy" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        {sections.map((section, i) => {
          const lines = section.split("\n");
          const isTitle = lines[0] === lines[0].toUpperCase() && lines[0].length > 5;
          return (
            <View key={i} style={{ marginBottom: t.spacing.lg }}>
              <Text style={{
                fontSize: isTitle ? t.font.xl : t.font.md,
                fontWeight: isTitle ? "700" as const : "400" as const,
                color: isTitle ? t.text : t.textSecondary,
                lineHeight: isTitle ? 28 : 22,
              }}>
                {lines.join("\n")}
              </Text>
            </View>
          );
        })}
        <View style={{ height: t.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}
