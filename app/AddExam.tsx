import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useExams } from "../hooks/useExams";
import { scheduleExamReminder } from "../services/notifications";
import Header from "../components/Header";

const EXAM_TYPES = [
  { key: "internal", label: "Internal", icon: "document-text", colorKey: "info" },
  { key: "mid", label: "Mid", icon: "alert-circle", colorKey: "warning" },
  { key: "semester", label: "Semester", icon: "school", colorKey: "danger" },
  { key: "practical", label: "Practical", icon: "flask", colorKey: "secondary" },
];

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

export default function AddExamScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { create } = useExams();
  const { theme: t } = useAppTheme();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("internal");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("120");
  const [location, setLocation] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("30");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const getTypeColor = (type: string) => {
    const et = EXAM_TYPES.find((e) => e.key === type);
    return et ? (t as any)[et.colorKey] || t.primary : t.primary;
  };

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter an exam title."); return; }
    setSaving(true);
    try {
      const exam = await create({
        title: title.trim(), subject: subject.trim(), exam_type: examType,
        date, time, duration_minutes: parseInt(duration || "120", 10),
        location, reminder_minutes: parseInt(reminderMinutes || "30", 10), notes, completed: false,
      });
      if (exam.id && parseInt(reminderMinutes || "30", 10) > 0) {
        try { await scheduleExamReminder(exam.id, exam.title, exam.date, exam.time, exam.reminder_minutes); } catch {}
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert("Error", e?.message || "Could not create exam."); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Add Exam" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 40 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} placeholder="e.g. Mid Term Examination" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Subject"><TextInput style={input(t)} value={subject} onChangeText={setSubject} placeholder="e.g. Math class" placeholderTextColor={t.textTertiary} /></Field>

        <Field label="Exam Type">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs }}>
            {EXAM_TYPES.map((et) => {
              const c = (t as any)[et.colorKey] || t.primary;
              const active = examType === et.key;
              return (
                <TouchableOpacity key={et.key} style={[chip(t), active && { backgroundColor: c, borderColor: c }]} onPress={() => setExamType(et.key)} activeOpacity={0.7}>
                  <Ionicons name={et.icon as any} size={14} color={active ? "#fff" : c} />
                  <Text style={[chipText(t), active && { color: "#fff" }]}>{et.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Date" style={{ flex: 1 }}><TextInput style={input(t)} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={t.textTertiary} /></Field>
          <Field label="Time" style={{ flex: 1 }}><TextInput style={input(t)} value={time} onChangeText={setTime} placeholder="09:00" placeholderTextColor={t.textTertiary} /></Field>
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Duration (min)" style={{ flex: 1 }}><TextInput style={input(t)} value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholderTextColor={t.textTertiary} /></Field>
          <Field label="Reminder (min before)" style={{ flex: 1 }}><TextInput style={input(t)} value={reminderMinutes} onChangeText={setReminderMinutes} keyboardType="number-pad" placeholderTextColor={t.textTertiary} /></Field>
        </View>

        <Field label="Location"><TextInput style={input(t)} value={location} onChangeText={setLocation} placeholder="e.g. Hall A" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Notes"><TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={t.textTertiary} multiline numberOfLines={3} /></Field>

        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Create Exam</Text>}
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
