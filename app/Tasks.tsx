import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useTasks } from "../hooks/useTasks";
import { cancelNotificationForTask } from "../services/notifications";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";
import AnimatedCheckbox from "../components/AnimatedCheckbox";

type Filter = "all" | "today" | "pending" | "completed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Done" },
];

const CATEGORY_ICONS: Record<string, string> = {
  general: "layers", assignment: "document-text", study: "book",
  project: "folder", personal: "person",
};

export default function TasksScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { tasks, loading, refresh, remove, toggle } = useTasks();
  const { theme: t } = useAppTheme();
  const [filter, setFilter] = useState<Filter>("all");

  const pColors: Record<string, string> = { low: t.success, medium: t.warning, high: t.danger };

  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    switch (filter) {
      case "today": return tasks.filter((tk) => tk.due_date === today && !tk.completed);
      case "pending": return tasks.filter((tk) => !tk.completed);
      case "completed": return tasks.filter((tk) => tk.completed);
      default: return tasks;
    }
  }, [tasks, filter, today]);

  const pendingCount = tasks.filter((tk) => !tk.completed).length;
  const todayCount = tasks.filter((tk) => tk.due_date === today && !tk.completed).length;

  const onDelete = (task: any) => {
    Alert.alert("Delete task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await cancelNotificationForTask(task.id); } catch {}
          remove(task.id);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Tasks" showAdd onAdd={() => navigation.navigate("AddTask")} />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={{ flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
          <View style={[statCard(t), { backgroundColor: t.primaryContainer }]}>
            <Ionicons name="list" size={18} color={t.primary} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.primary }}>{tasks.length}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Total</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.warningContainer }]}>
            <Ionicons name="time" size={18} color={t.warning} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.warning }}>{pendingCount}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Pending</Text>
          </View>
          <View style={[statCard(t), { backgroundColor: t.successContainer }]}>
            <Ionicons name="checkmark-circle" size={18} color={t.success} />
            <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.success }}>{tasks.length - pendingCount}</Text>
            <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>Done</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <View style={{ flexDirection: "row", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[filterChip(t), filter === f.key && { backgroundColor: t.primary, borderColor: t.primary }]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
              accessibilityLabel={`Filter by ${f.label}`}
              accessibilityHint={filter === f.key ? "Currently selected" : `Shows ${f.label} tasks`}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
            >
              <Text style={[filterText(t), filter === f.key && { color: "#fff" }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task list */}
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="checkbox-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>
              {filter === "completed" ? "No completed tasks" : "No tasks yet"}
            </Text>
          </View>
        ) : (
          filtered.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[taskCard(t), task.completed && { opacity: 0.6 }]}
              onPress={() => navigation.navigate("EditTask", { id: task.id })}
              activeOpacity={0.8}
            >
              <AnimatedCheckbox
                checked={task.completed}
                onPress={() => toggle(task.id!)}
                checkedColor={t.success}
                uncheckedColor={t.border}
                accessibilityLabel={task.completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
              />
              <View style={{ flex: 1, marginLeft: t.spacing.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
                  <Text style={[taskTitle(t), task.completed && { textDecorationLine: "line-through", color: t.textTertiary }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={[priorityBadge(t), { backgroundColor: pColors[task.priority] + "20" }]}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: pColors[task.priority] }}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: 4 }}>
                  {task.due_date ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="calendar-outline" size={12} color={t.textTertiary} />
                      <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{task.due_date}</Text>
                    </View>
                  ) : null}
                  {task.due_time ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color={t.textTertiary} />
                      <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{task.due_time}</Text>
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Ionicons name={CATEGORY_ICONS[task.category] as any} size={12} color={t.textTertiary} />
                    <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{task.category}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => onDelete(task)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={18} color={t.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <AnimatedFAB
        onPress={() => navigation.navigate("AddTask")}
        backgroundColor={t.primary}
        entranceDelay={400}
        style={{ position: 'absolute', right: 16, bottom: 60 + insets.bottom + 16, zIndex: 100 }}
        accessibilityLabel="Add new task"
        accessibilityHint="Opens the add task form"
        accessibilityRole="button"
      />
    </View>
  );
}

const statCard = (t: any) => ({ flex: 1, alignItems: "center", paddingVertical: t.spacing.md, borderRadius: t.radius.lg, gap: 4 });
const filterChip = (t: any) => ({ paddingHorizontal: 14, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface });
const filterText = (t: any) => ({ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary });
const taskCard = (t: any) => ({ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.sm, ...t.shadow.sm });
const taskTitle = (t: any) => ({ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text, flex: 1 });
const priorityBadge = (t: any) => ({ paddingHorizontal: 8, paddingVertical: 2, borderRadius: t.radius.full });
