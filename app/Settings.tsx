import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useSettings } from "../constants/SettingsContext";
import Header from "../components/Header";

type FontSize = "small" | "default" | "large" | "extra_large";
const FONT_OPTIONS: { key: FontSize; label: string; preview: number }[] = [
  { key: "small", label: "Small", preview: 13 },
  { key: "default", label: "Default", preview: 15 },
  { key: "large", label: "Large", preview: 17 },
  { key: "extra_large", label: "XL", preview: 20 },
];

const REMINDER_OPTIONS = [5, 10, 15, 30, 60];
const SOUND_OPTIONS: { key: string; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "alarm", label: "Alarm" },
  { key: "gentle", label: "Gentle" },
  { key: "silent", label: "Silent" },
];
const NOTIF_STYLE_OPTIONS: { key: string; label: string }[] = [
  { key: "full", label: "Full (Heads-up)" },
  { key: "minimal", label: "Minimal (Silent)" },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { theme: t, mode, setMode, fontSize, setFontSize } = useAppTheme();
  const { settings, updateSetting } = useSettings();

  const modes: { key: ThemeMode; label: string; icon: string }[] = [
    { key: "light", label: "Light", icon: "sunny" },
    { key: "dark", label: "Dark", icon: "moon" },
    { key: "amoled", label: "AMOLED", icon: "phone-portrait" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }} showsVerticalScrollIndicator={false}>

        {/* APPEARANCE */}
        <SectionHeader t={t} icon="color-palette" title="Appearance" />

        <View style={card(t)}>
          <Text style={label(t)}>Theme</Text>
          <View style={{ flexDirection: "row", gap: t.spacing.sm, marginTop: t.spacing.xs }}>
            {modes.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[themeBtn(t), mode === m.key && themeBtnActive(t)]}
                onPress={() => setMode(m.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={m.icon as any} size={16} color={mode === m.key ? t.primary : t.textSecondary} />
                <Text style={[themeBtnText(t), mode === m.key && { color: t.primary }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={card(t)}>
          <Text style={label(t)}>Font Size</Text>
          <View style={{ flexDirection: "row", gap: t.spacing.sm, marginTop: t.spacing.xs }}>
            {FONT_OPTIONS.map((fo) => (
              <TouchableOpacity
                key={fo.key}
                style={[themeBtn(t), fontSize === fo.key && themeBtnActive(t)]}
                onPress={() => setFontSize(fo.key)}
                activeOpacity={0.7}
              >
                <Text style={[themeBtnText(t), fontSize === fo.key && { color: t.primary }, { fontSize: fo.preview * 0.8 }]}>
                  {fo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <SectionHeader t={t} icon="notifications" title="Notifications" />

        <View style={card(t)}>
          <Text style={label(t)}>Default Reminder</Text>
          <Text style={sublabel(t)}>Applied to new events and tasks</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginTop: t.spacing.sm }}>
            {REMINDER_OPTIONS.map((min) => (
              <TouchableOpacity
                key={min}
                style={[chip(t), settings.defaultReminder === min && chipActive(t)]}
                onPress={() => updateSetting("defaultReminder", min)}
                activeOpacity={0.7}
              >
                <Text style={[chipText(t), settings.defaultReminder === min && chipTextActive(t)]}>{min}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={card(t)}>
          <View style={row(t)}>
            <View style={{ flex: 1 }}>
              <Text style={label(t)}>Vibration</Text>
              <Text style={sublabel(t)}>Vibrate on notification</Text>
            </View>
            <Switch
              value={settings.vibration}
              onValueChange={(v) => updateSetting("vibration", v)}
              trackColor={{ true: t.primary, false: t.border }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={card(t)}>
          <Text style={label(t)}>Alarm Sound</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginTop: t.spacing.sm }}>
            {SOUND_OPTIONS.map((so) => (
              <TouchableOpacity
                key={so.key}
                style={[chip(t), settings.alarmSound === so.key && chipActive(t)]}
                onPress={() => updateSetting("alarmSound", so.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[chipText(t), settings.alarmSound === so.key && chipTextActive(t)]}>{so.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={card(t)}>
          <Text style={label(t)}>Notification Style</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginTop: t.spacing.sm }}>
            {NOTIF_STYLE_OPTIONS.map((ns) => (
              <TouchableOpacity
                key={ns.key}
                style={[chip(t), settings.notificationStyle === ns.key && chipActive(t)]}
                onPress={() => updateSetting("notificationStyle", ns.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[chipText(t), settings.notificationStyle === ns.key && chipTextActive(t)]}>{ns.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GENERAL */}
        <SectionHeader t={t} icon="settings" title="General" />

        <View style={card(t)}>
          <View style={row(t)}>
            <View style={{ flex: 1 }}>
              <Text style={label(t)}>Language</Text>
              <Text style={sublabel(t)}>App language</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
              <Ionicons name="globe-outline" size={16} color={t.textSecondary} />
              <Text style={{ fontSize: t.font.sm, color: t.textSecondary }}>English</Text>
              <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
            </View>
          </View>
        </View>

        <View style={card(t)}>
          <TouchableOpacity style={row(t)} onPress={() => navigation.navigate("About")} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={label(t)}>About</Text>
              <Text style={sublabel(t)}>SmartNotify v1.0.0</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={card(t)}>
          <TouchableOpacity style={row(t)} onPress={() => navigation.navigate("PrivacyPolicy")} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={label(t)}>Privacy Policy</Text>
              <Text style={sublabel(t)}>How we handle your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={card(t)}>
          <TouchableOpacity style={row(t)} onPress={() => navigation.navigate("Feedback")} activeOpacity={0.7}>
            <View style={{ flex: 1 }}>
              <Text style={label(t)}>Send Feedback</Text>
              <Text style={sublabel(t)}>Report bugs or suggest features</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

type ThemeMode = "light" | "dark" | "amoled";

function SectionHeader({ t, icon, title }: { t: any; icon: string; title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: t.spacing.lg, marginBottom: t.spacing.sm, paddingHorizontal: t.spacing.xs }}>
      <Ionicons name={icon as any} size={18} color={t.primary} />
      <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>{title}</Text>
    </View>
  );
}

const card = (t: any) => ({
  backgroundColor: t.card,
  borderRadius: t.radius.lg,
  borderWidth: 1,
  borderColor: t.cardBorder,
  padding: t.spacing.md,
  marginBottom: t.spacing.sm,
  ...t.shadow.sm,
});
const label = (t: any) => ({ fontSize: t.font.md, fontWeight: t.font.weight.semibold as any, color: t.text });
const sublabel = (t: any) => ({ fontSize: t.font.xs, color: t.textSecondary, marginTop: 2 });
const row = (t: any) => ({ flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const });
const themeBtn = (t: any) => ({ flex: 1, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 6, paddingVertical: t.spacing.sm, borderRadius: t.radius.md, borderWidth: 1.5, borderColor: t.border, backgroundColor: t.surfaceVariant });
const themeBtnActive = (t: any) => ({ backgroundColor: t.primaryContainer, borderColor: t.primary });
const themeBtnText = (t: any) => ({ fontSize: t.font.sm, fontWeight: t.font.weight.semibold as any, color: t.textSecondary });
const chip = (t: any) => ({ paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.full, borderWidth: 1.5, borderColor: t.border, backgroundColor: t.surfaceVariant });
const chipActive = (t: any) => ({ backgroundColor: t.primaryContainer, borderColor: t.primary });
const chipText = (t: any) => ({ fontSize: t.font.sm, fontWeight: t.font.weight.semibold as any, color: t.textSecondary });
const chipTextActive = (t: any) => ({ color: t.primary });
