import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useTasks } from "../hooks/useTasks";
import { scheduleTaskReminder } from "../services/notifications";
import Header from "../components/Header";

const PRIORITIES = ["low", "medium", "high"] as const;
const CATEGORIES = ["general", "assignment", "study", "project", "personal"] as const;
const PRIORITY_COLORS: Record<string, string> = {};
const PRIORITY_ICONS: Record<string, string> = { low: "arrow-down", medium: "remove", high: "arrow-up" };
const CATEGORY_ICONS: Record<string, string> = {
  general: "layers", assignment: "document-text", study: "book",
  project: "folder", personal: "person",
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTaskScreen() {
  const navigation = useNavigation();
  const { create } = useTasks();
  const { theme: t } = useAppTheme();
  PRIORITY_COLORS.low = t.success;
  PRIORITY_COLORS.medium = t.warning;
  PRIORITY_COLORS.high = t.danger;

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDate, setDueDate] = useState(todayStr());
  const [dueTime, setDueTime] = useState("09:00");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [category, setCategory] = useState<string>("general");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a task title.");
      return;
    }
    if (title.trim().length > 200) {
      Alert.alert("Title too long", "Title must be under 200 characters.");
      return;
    }
    const mins = parseInt(reminderMinutes || "0", 10);
    if (mins < 0 || mins > 1440) {
      Alert.alert("Invalid reminder", "Reminder must be between 0 and 1440 minutes.");
      return;
    }
    setSaving(true);
    try {
      const task = await create({
        title: title.trim(),
        priority,
        due_date: dueDate,
        due_time: dueTime,
        reminder_minutes: parseInt(reminderMinutes || "0", 10),
        category,
        notes,
        completed: false,
      });
      if (task.id && parseInt(reminderMinutes || "0", 10) > 0) {
        try {
          await scheduleTaskReminder(
            task.id, task.title, task.due_date, task.due_time, task.reminder_minutes
          );
        } catch {}
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not create task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Add Task" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}>
        <Field label="Title">
          <TextInput style={input(t)} value={title} onChangeText={setTitle} placeholder="e.g. Submit assignment" placeholderTextColor={t.textTertiary} />
        </Field>

        <Field label="Priority">
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[chip(t), priority === p && { backgroundColor: PRIORITY_COLORS[p], borderColor: PRIORITY_COLORS[p] }]}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
              >
                <Ionicons name={PRIORITY_ICONS[p] as any} size={14} color={priority === p ? "#fff" : PRIORITY_COLORS[p]} />
                <Text style={[chipText(t), priority === p && { color: "#fff" }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Category">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[chip(t), category === c && { backgroundColor: t.primary, borderColor: t.primary }]}
                onPress={() => setCategory(c)}
                activeOpacity={0.7}
              >
                <Ionicons name={CATEGORY_ICONS[c] as any} size={13} color={category === c ? "#fff" : t.textSecondary} />
                <Text style={[chipText(t), category === c && { color: "#fff" }]}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Due Date" style={{ flex: 1 }}>
            <TextInput style={input(t)} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={t.textTertiary} />
          </Field>
          <Field label="Due Time" style={{ flex: 1 }}>
            <TextInput style={input(t)} value={dueTime} onChangeText={setDueTime} placeholder="HH:MM" placeholderTextColor={t.textTertiary} />
          </Field>
        </View>

        <Field label="Reminder (minutes before, 0 = none)">
          <TextInput style={input(t)} value={reminderMinutes} onChangeText={setReminderMinutes} keyboardType="number-pad" placeholder="0" placeholderTextColor={t.textTertiary} />
        </Field>

        <Field label="Notes">
          <TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={t.textTertiary} multiline numberOfLines={3} />
        </Field>

        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Create Task</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return <View style={[{ marginBottom: 14 }, style]}><Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>{label}</Text>{children}</View>;
}

const input = (t: any) => ({
  backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md,
  paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: t.text,
});
const chip = (t: any) => ({
  flexDirection: "row" as const, alignItems: "center" as const, gap: 4,
  paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.radius.full,
  borderWidth: 1, borderColor: t.border, backgroundColor: t.surfaceVariant,
});
const chipText = (t: any) => ({ fontSize: 13, fontWeight: "600" as const, color: t.textSecondary });
const btn = (t: any) => ({
  backgroundColor: t.primary, borderRadius: t.radius.lg, paddingVertical: 14, alignItems: "center" as const, marginTop: 8,
});
const btnText = (t: any) => ({ color: "#fff", fontSize: 16, fontWeight: "700" as const });
