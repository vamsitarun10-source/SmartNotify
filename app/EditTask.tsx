import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useTasks } from "../hooks/useTasks";
import { cancelNotificationForTask, scheduleTaskReminder } from "../services/notifications";
import Header from "../components/Header";

const PRIORITIES = ["low", "medium", "high"] as const;
const CATEGORIES = ["general", "assignment", "study", "project", "personal"] as const;
const CATEGORY_ICONS: Record<string, string> = {
  general: "layers", assignment: "document-text", study: "book",
  project: "folder", personal: "person",
};

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;
  const { tasks, update, loading } = useTasks();
  const { theme: t } = useAppTheme();
  const pColors: Record<string, string> = { low: t.success, medium: t.warning, high: t.danger };
  const pIcons: Record<string, string> = { low: "arrow-down", medium: "remove", high: "arrow-up" };

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && tasks.length && !ready) {
      const found = tasks.find((t) => t.id === id);
      if (found) {
        setTitle(found.title);
        setPriority(found.priority);
        setDueDate(found.due_date);
        setDueTime(found.due_time);
        setReminderMinutes(String(found.reminder_minutes));
        setCategory(found.category);
        setNotes(found.notes);
        setReady(true);
      }
    }
  }, [id, tasks, ready]);

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter a task title."); return; }
    setSaving(true);
    try {
      if (id) {
        try { await cancelNotificationForTask(id); } catch {}
        const updated = await update(id, {
          title: title.trim(), priority, due_date: dueDate, due_time: dueTime,
          reminder_minutes: parseInt(reminderMinutes || "0", 10), category, notes,
        });
        const mins = parseInt(reminderMinutes || "0", 10);
        if (mins > 0 && updated.id) {
          try {
            await scheduleTaskReminder(updated.id, updated.title, updated.due_date, updated.due_time, mins);
          } catch {}
        }
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not update task.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: t.background }}><Header title="Edit Task" showBack /><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text style={{ color: t.textSecondary }}>{loading ? "Loading..." : "Task not found."}</Text></View></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Edit Task" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} /></Field>
        <Field label="Priority">
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity key={p} style={[chip(t), priority === p && { backgroundColor: pColors[p], borderColor: pColors[p] }]} onPress={() => setPriority(p)} activeOpacity={0.7}>
                <Ionicons name={pIcons[p] as any} size={14} color={priority === p ? "#fff" : pColors[p]} />
                <Text style={[chipText(t), priority === p && { color: "#fff" }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <Field label="Category">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} style={[chip(t), category === c && { backgroundColor: t.primary, borderColor: t.primary }]} onPress={() => setCategory(c)} activeOpacity={0.7}>
                <Ionicons name={CATEGORY_ICONS[c] as any} size={13} color={category === c ? "#fff" : t.textSecondary} />
                <Text style={[chipText(t), category === c && { color: "#fff" }]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Due Date" style={{ flex: 1 }}><TextInput style={input(t)} value={dueDate} onChangeText={setDueDate} /></Field>
          <Field label="Due Time" style={{ flex: 1 }}><TextInput style={input(t)} value={dueTime} onChangeText={setDueTime} /></Field>
        </View>
        <Field label="Reminder (min before, 0 = none)"><TextInput style={input(t)} value={reminderMinutes} onChangeText={setReminderMinutes} keyboardType="number-pad" /></Field>
        <Field label="Notes"><TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} /></Field>
        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Update Task</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return <View style={[{ marginBottom: 14 }, style]}><Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>{label}</Text>{children}</View>;
}
const input = (t: any) => ({ backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: t.text });
const chip = (t: any) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surfaceVariant });
const chipText = (t: any) => ({ fontSize: 13, fontWeight: "600" as const, color: t.textSecondary });
const btn = (t: any) => ({ backgroundColor: t.primary, borderRadius: t.radius.lg, paddingVertical: 14, alignItems: "center" as const, marginTop: 8 });
const btnText = (t: any) => ({ color: "#fff", fontSize: 16, fontWeight: "700" as const });
