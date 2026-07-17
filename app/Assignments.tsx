import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useAssignments } from "../hooks/useAssignments";
import { cancelNotificationForAssignment } from "../services/notifications";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";
import AnimatedCheckbox from "../components/AnimatedCheckbox";

type Filter = "all" | "pending" | "completed";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Done" },
];

export default function AssignmentsScreen() {
  const navigation = useNavigation<any>();
  const { assignments, loading, refresh, remove, toggle } = useAssignments();
  const { theme: t } = useAppTheme();
  const [filter, setFilter] = useState<Filter>("all");
  const pColors: Record<string, string> = { low: t.success, medium: t.warning, high: t.danger };

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending": return assignments.filter((a) => !a.completed);
      case "completed": return assignments.filter((a) => a.completed);
      default: return assignments;
    }
  }, [assignments, filter]);

  const pendingCount = assignments.filter((a) => !a.completed).length;

  const onDelete = (a: any) => {
    Alert.alert("Delete", `Delete "${a.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await cancelNotificationForAssignment(a.id); } catch {} remove(a.id); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Assignments" showAdd onAdd={() => navigation.navigate("AddAssignment")} />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
          <View style={[statCard(t), { backgroundColor: t.primaryContainer }]}>
            <Ionicons name="document-text" size={18} color={t.primary} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.primary }}>{assignments.length}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Total</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.warningContainer }]}>
            <Ionicons name="time" size={18} color={t.warning} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.warning }}>{pendingCount}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Pending</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.successContainer }]}>
            <Ionicons name="checkmark-circle" size={18} color={t.success} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.success }}>{assignments.length - pendingCount}</Text>
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

        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="document-text-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No assignments yet</Text>
          </View>
        ) : (
          filtered.map((a) => {
            const pColor = pColors[a.priority] || t.warning;
            return (
              <TouchableOpacity key={a.id} style={[card(t), a.completed && { opacity: 0.6 }]} onPress={() => navigation.navigate("EditAssignment", { id: a.id })} activeOpacity={0.8}>
                <AnimatedCheckbox
                  checked={a.completed}
                  onPress={() => toggle(a.id!)}
                  checkedColor={t.success}
                  uncheckedColor={t.border}
                  accessibilityLabel={a.completed ? `Mark "${a.title}" as pending` : `Mark "${a.title}" as completed`}
                />
                <View style={{ flex: 1, marginLeft: t.spacing.sm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
                    <Text style={[titleStyle(t), a.completed && { textDecorationLine: "line-through", color: t.textTertiary }]} numberOfLines={1}>{a.title}</Text>
                    <View style={{ backgroundColor: pColor + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: t.radius.full }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: pColor }}>{a.priority}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: 4, flexWrap: "wrap" }}>
                    {a.subject ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: t.primaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: t.radius.full }}>
                        <Ionicons name="school-outline" size={11} color={t.primary} />
                        <Text style={{ fontSize: 10, fontWeight: "600", color: t.primary }}>{a.subject}</Text>
                      </View>
                    ) : null}
                    {a.due_date ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Ionicons name="calendar-outline" size={12} color={t.textTertiary} />
                        <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{a.due_date}</Text>
                      </View>
                    ) : null}
                    {a.attachment ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Ionicons name="attach-outline" size={12} color={t.textTertiary} />
                        <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{a.attachment}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => onDelete(a)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <AnimatedFAB
        onPress={() => navigation.navigate("AddAssignment")}
        backgroundColor={t.primary}
        entranceDelay={400}
        accessibilityLabel="Add new assignment"
        accessibilityHint="Opens the add assignment form"
        accessibilityRole="button"
      />
    </View>
  );
}

const statCard = (t: any) => ({ flex: 1, alignItems: "center", paddingVertical: t.spacing.md, borderRadius: t.radius.lg, gap: 4 });
const filterChip = (t: any) => ({ paddingHorizontal: 14, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface });
const filterText = (t: any) => ({ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary });
const card = (t: any) => ({ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.sm, ...t.shadow.sm });
const titleStyle = (t: any) => ({ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text, flex: 1 });
