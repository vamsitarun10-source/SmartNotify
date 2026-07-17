import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useAssignments } from "../hooks/useAssignments";
import { scheduleAssignmentReminder } from "../services/notifications";
import Header from "../components/Header";

const PRIORITIES = ["low", "medium", "high"] as const;
const CATEGORY_ICONS: Record<string, string> = { general: "layers", assignment: "document-text", study: "book", project: "folder", personal: "person" };

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function AddAssignmentScreen() {
  const navigation = useNavigation();
  const { create } = useAssignments();
  const { theme: t } = useAppTheme();
  const pColors: Record<string, string> = { low: t.success, medium: t.warning, high: t.danger };

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState(todayStr());
  const [dueTime, setDueTime] = useState("23:59");
  const [priority, setPriority] = useState("medium");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter an assignment title."); return; }
    setSaving(true);
    try {
      const a = await create({
        title: title.trim(), subject: subject.trim(), due_date: dueDate, due_time: dueTime,
        priority, notes, attachment, reminder_minutes: parseInt(reminderMinutes || "0", 10), completed: false,
      });
      if (a.id && parseInt(reminderMinutes || "0", 10) > 0) {
        try { await scheduleAssignmentReminder(a.id, a.title, a.due_date, a.due_time, a.reminder_minutes); } catch {}
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert("Error", e?.message || "Could not create assignment."); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Add Assignment" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} placeholder="e.g. Essay on Climate Change" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Subject"><TextInput style={input(t)} value={subject} onChangeText={setSubject} placeholder="e.g. Math class" placeholderTextColor={t.textTertiary} /></Field>

        <Field label="Priority">
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity key={p} style={[chip(t), priority === p && { backgroundColor: pColors[p], borderColor: pColors[p] }]} onPress={() => setPriority(p)} activeOpacity={0.7}>
                <Ionicons name={(p === "low" ? "arrow-down" : p === "high" ? "arrow-up" : "remove") as any} size={14} color={priority === p ? "#fff" : pColors[p]} />
                <Text style={[chipText(t), priority === p && { color: "#fff" }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Due Date" style={{ flex: 1 }}><TextInput style={input(t)} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={t.textTertiary} /></Field>
          <Field label="Due Time" style={{ flex: 1 }}><TextInput style={input(t)} value={dueTime} onChangeText={setDueTime} placeholder="23:59" placeholderTextColor={t.textTertiary} /></Field>
        </View>

        <Field label="Reminder (min before, 0 = none)"><TextInput style={input(t)} value={reminderMinutes} onChangeText={setReminderMinutes} keyboardType="number-pad" placeholder="0" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Attachment (filename)"><TextInput style={input(t)} value={attachment} onChangeText={setAttachment} placeholder="e.g. essay_draft.pdf" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Notes"><TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={t.textTertiary} multiline numberOfLines={3} /></Field>

        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Create Assignment</Text>}
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
