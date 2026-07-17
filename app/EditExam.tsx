import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useExams } from "../hooks/useExams";
import { cancelNotificationForExam, scheduleExamReminder } from "../services/notifications";
import Header from "../components/Header";

const EXAM_TYPES = [
  { key: "internal", label: "Internal", icon: "document-text", colorKey: "info" },
  { key: "mid", label: "Mid", icon: "alert-circle", colorKey: "warning" },
  { key: "semester", label: "Semester", icon: "school", colorKey: "danger" },
  { key: "practical", label: "Practical", icon: "flask", colorKey: "secondary" },
];

export default function EditExamScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;
  const { exams, update, loading } = useExams();
  const { theme: t } = useAppTheme();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("internal");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("120");
  const [location, setLocation] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("30");
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && exams.length && !ready) {
      const found = exams.find((e) => e.id === id);
      if (found) {
        setTitle(found.title); setSubject(found.subject); setExamType(found.exam_type);
        setDate(found.date); setTime(found.time); setDuration(String(found.duration_minutes));
        setLocation(found.location); setReminderMinutes(String(found.reminder_minutes));
        setNotes(found.notes); setReady(true);
      }
    }
  }, [id, exams, ready]);

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter an exam title."); return; }
    setSaving(true);
    try {
      if (id) {
        try { await cancelNotificationForExam(id); } catch {}
        const updated = await update(id, {
          title: title.trim(), subject: subject.trim(), exam_type: examType,
          date, time, duration_minutes: parseInt(duration || "120", 10),
          location, reminder_minutes: parseInt(reminderMinutes || "30", 10), notes,
        });
        const mins = parseInt(reminderMinutes || "30", 10);
        if (mins > 0 && updated.id) {
          try { await scheduleExamReminder(updated.id, updated.title, updated.date, updated.time, mins); } catch {}
        }
      }
      navigation.goBack();
    } catch (e: any) { Alert.alert("Error", e?.message || "Could not update."); }
    finally { setSaving(false); }
  };

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: t.background }}><Header title="Edit Exam" showBack /><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text style={{ color: t.textSecondary }}>{loading ? "Loading..." : "Not found."}</Text></View></View>;
  }

  const getTypeColor = (type: string) => {
    const et = EXAM_TYPES.find((e) => e.key === type);
    return et ? (t as any)[et.colorKey] || t.primary : t.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Edit Exam" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} /></Field>
        <Field label="Subject"><TextInput style={input(t)} value={subject} onChangeText={setSubject} /></Field>
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
          <Field label="Date" style={{ flex: 1 }}><TextInput style={input(t)} value={date} onChangeText={setDate} /></Field>
          <Field label="Time" style={{ flex: 1 }}><TextInput style={input(t)} value={time} onChangeText={setTime} /></Field>
        </View>
        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <Field label="Duration (min)" style={{ flex: 1 }}><TextInput style={input(t)} value={duration} onChangeText={setDuration} keyboardType="number-pad" /></Field>
          <Field label="Reminder (min)" style={{ flex: 1 }}><TextInput style={input(t)} value={reminderMinutes} onChangeText={setReminderMinutes} keyboardType="number-pad" /></Field>
        </View>
        <Field label="Location"><TextInput style={input(t)} value={location} onChangeText={setLocation} /></Field>
        <Field label="Notes"><TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} /></Field>
        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Update Exam</Text>}
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
