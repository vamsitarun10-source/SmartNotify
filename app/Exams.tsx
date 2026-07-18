import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useExams } from "../hooks/useExams";
import { cancelNotificationForExam } from "../services/notifications";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";

type Filter = "all" | "upcoming" | "completed";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Done" },
];

const EXAM_TYPES: Record<string, { icon: string; colorKey: string }> = {
  internal: { icon: "document-text", colorKey: "info" },
  mid: { icon: "alert-circle", colorKey: "warning" },
  semester: { icon: "school", colorKey: "danger" },
  practical: { icon: "flask", colorKey: "secondary" },
};

function formatCountdown(dateStr: string, timeStr: string): string {
  const target = new Date(dateStr + "T" + timeStr + ":00");
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "Now";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
  return parts.join(" ");
}

export default function ExamsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { exams, loading, refresh, remove, toggle } = useExams();
  const { theme: t } = useAppTheme();
  const [filter, setFilter] = useState<Filter>("all");
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    switch (filter) {
      case "upcoming": return exams.filter((e) => !e.completed && e.date >= today);
      case "completed": return exams.filter((e) => e.completed);
      default: return exams;
    }
  }, [exams, filter, today]);

  const upcomingCount = exams.filter((e) => !e.completed && e.date >= today).length;

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      const key = e.date || "No date";
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const onDelete = (exam: any) => {
    Alert.alert("Delete", `Delete "${exam.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await cancelNotificationForExam(exam.id); } catch {} remove(exam.id); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Exams" showAdd onAdd={() => navigation.navigate("AddExam")} />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
          <View style={[statCard(t), { backgroundColor: t.primaryContainer }]}>
            <Ionicons name="school" size={18} color={t.primary} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.primary }}>{exams.length}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Total</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.warningContainer }]}>
            <Ionicons name="time" size={18} color={t.warning} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.warning }}>{upcomingCount}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Upcoming</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.successContainer }]}>
            <Ionicons name="checkmark-circle" size={18} color={t.success} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.success }}>{exams.length - upcomingCount}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Done</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f.key} style={[filterChip(t), filter === f.key && { backgroundColor: t.primary, borderColor: t.primary }]} onPress={() => setFilter(f.key)} activeOpacity={0.7}>
              <Text style={[filterText(t), filter === f.key && { color: "#fff" }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {grouped.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="school-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No exams yet</Text>
          </View>
        ) : (
          grouped.map(([dateStr, dateExams]) => (
            <View key={dateStr} style={{ marginBottom: t.spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
                <View style={{ width: 32, height: 32, borderRadius: t.radius.sm, backgroundColor: t.primaryContainer, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="calendar" size={16} color={t.primary} />
                </View>
                <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>{dateStr}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: t.divider }} />
              </View>

              {dateExams.map((exam) => {
                const typeInfo = EXAM_TYPES[exam.exam_type] || EXAM_TYPES.internal;
                const typeColor = (t as any)[typeInfo.colorKey] || t.primary;
                const countdown = formatCountdown(exam.date, exam.time);
                return (
                  <TouchableOpacity key={exam.id} style={[card(t), exam.completed && { opacity: 0.6 }]} onPress={() => navigation.navigate("EditExam", { id: exam.id })} activeOpacity={0.8}>
                    <TouchableOpacity style={[checkbox(t), exam.completed && { backgroundColor: t.success, borderColor: t.success }]} onPress={() => toggle(exam.id!)} activeOpacity={0.6}>
                      {exam.completed ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: t.spacing.sm }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
                        <Text style={[titleStyle(t), exam.completed && { textDecorationLine: "line-through", color: t.textTertiary }]} numberOfLines={1}>{exam.title}</Text>
                        <View style={{ backgroundColor: typeColor + "20", paddingHorizontal: 6, paddingVertical: 1, borderRadius: t.radius.full, flexDirection: "row", alignItems: "center", gap: 3 }}>
                          <Ionicons name={typeInfo.icon as any} size={10} color={typeColor} />
                          <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor }}>{exam.exam_type}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: 4, flexWrap: "wrap" }}>
                        {exam.subject ? (
                          <Text style={{ fontSize: t.font.xs, color: t.primary, fontWeight: "600" }}>{exam.subject}</Text>
                        ) : null}
                        <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{exam.time}</Text>
                        {exam.duration_minutes ? (
                          <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{exam.duration_minutes}min</Text>
                        ) : null}
                        {exam.location ? (
                          <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{exam.location}</Text>
                        ) : null}
                      </View>
                    </View>
                    {!exam.completed && exam.date >= today ? (
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: t.font.xs, fontWeight: t.font.weight.semibold, color: typeColor }}>{countdown}</Text>
                        <Text style={{ fontSize: 10, color: t.textTertiary }}>left</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity onPress={() => onDelete(exam)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: t.spacing.sm }}>
                      <Ionicons name="trash-outline" size={18} color={t.danger} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <AnimatedFAB
        onPress={() => navigation.navigate("AddExam")}
        backgroundColor={t.primary}
        entranceDelay={400}
        style={{ position: 'absolute', right: 16, bottom: 60 + insets.bottom + 16, zIndex: 100 }}
        accessibilityLabel="Add new exam"
        accessibilityHint="Opens the add exam form"
        accessibilityRole="button"
      />
    </View>
  );
}

const statCard = (t: any) => ({ flex: 1, alignItems: "center", paddingVertical: t.spacing.md, borderRadius: t.radius.lg, gap: 4 });
const filterChip = (t: any) => ({ paddingHorizontal: 14, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface });
const filterText = (t: any) => ({ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary });
const card = (t: any) => ({ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.sm, ...t.shadow.sm });
const checkbox = (t: any) => ({ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: t.border, alignItems: "center", justifyContent: "center" });
const titleStyle = (t: any) => ({ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text, flex: 1 });
