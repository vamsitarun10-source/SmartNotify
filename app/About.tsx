import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { APP_NAME, APP_VERSION, APP_BUILD, DEVELOPER, SUPPORT_EMAIL, PLAY_STORE_URL } from "../constants/appInfo";
import Header from "../components/Header";

export default function AboutScreen() {
  const { theme: t } = useAppTheme();

  const items = [
    { icon: "information-circle", label: "Version", value: `${APP_VERSION} (${APP_BUILD})` },
    { icon: "person", label: "Developer", value: DEVELOPER },
    { icon: "mail", label: "Support", value: SUPPORT_EMAIL, onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`) },
    { icon: "star", label: "Rate Us", value: "Rate on Play Store", onPress: () => Linking.openURL(PLAY_STORE_URL) },
    { icon: "shield-checkmark", label: "Privacy Policy", value: "View policy", onPress: () => (global as any).__navigation?.navigate("PrivacyPolicy") },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="About" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md }} showsVerticalScrollIndicator={false}>
        {/* App Logo */}
        <View style={{ alignItems: "center", marginBottom: t.spacing.xl }}>
          <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: t.primaryContainer, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="school" size={40} color={t.primary} />
          </View>
          <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.text, marginTop: t.spacing.sm }}>{APP_NAME}</Text>
          <Text style={{ fontSize: t.font.sm, color: t.textSecondary }}>AI-Powered Class Scheduling</Text>
        </View>

        {/* Info Items */}
        <View style={{ backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, overflow: "hidden" }}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{ flexDirection: "row", alignItems: "center", padding: t.spacing.md, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: t.divider }}
              onPress={item.onPress}
              disabled={!item.onPress}
              activeOpacity={item.onPress ? 0.6 : 1}
            >
              <Ionicons name={item.icon as any} size={20} color={t.primary} />
              <View style={{ flex: 1, marginLeft: t.spacing.sm }}>
                <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: t.font.sm, color: item.onPress ? t.primary : t.textSecondary }}>{item.value}</Text>
              {item.onPress ? <Ionicons name="chevron-forward" size={16} color={t.textTertiary} style={{ marginLeft: t.spacing.xs }} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits */}
        <View style={{ alignItems: "center", marginTop: t.spacing.xl, paddingVertical: t.spacing.lg }}>
          <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>Made with AI assistance</Text>
          <Text style={{ fontSize: t.font.xs, color: t.textTertiary, marginTop: 4 }}>© 2026 {DEVELOPER}. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
