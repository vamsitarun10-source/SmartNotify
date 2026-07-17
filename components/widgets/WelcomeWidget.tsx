import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function WelcomeWidget() {
  const { theme: t } = useAppTheme();
  const { user } = useAuth();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = clock.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = clock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginBottom: 2 }}>{dateStr}</Text>
        <Text style={{ fontSize: t.font.hero, fontWeight: t.font.weight.bold, color: t.text }}>
          {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </Text>
        <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: 4 }}>Here's your schedule overview</Text>
      </View>
      <View style={{ backgroundColor: t.primaryContainer, borderRadius: t.radius.lg, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, alignItems: "center" }}>
        <Ionicons name="time" size={18} color={t.primary} />
        <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.primary, marginTop: 2 }}>{timeStr}</Text>
      </View>
    </View>
  );
}
