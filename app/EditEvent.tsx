import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppTheme } from "../constants/ThemeContext";
import { useEvents } from "../hooks/useEvents";
import type { ClassEvent } from "../services/events";
import Header from "../components/Header";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export default function EditEventScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;
  const { events, update, loading } = useEvents();
  const { theme: t } = useAppTheme();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminderBefore, setReminderBefore] = useState("15");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && events.length && !ready) {
      const found = events.find((e) => e.id === id);
      if (found) {
        setTitle(found.title);
        setSubject(found.subject || "");
        setDate(found.date);
        setTime(found.time);
        setReminderBefore(String(found.reminder_before));
        setLocation(found.location || "");
        setNotes(found.notes || "");
        setReady(true);
      }
    }
  }, [id, events, ready]);

  const onSubmit = async () => {
    if (!id || !title.trim()) {
      Alert.alert("Missing fields", "Title is required.");
      return;
    }
    if (!DATE_RE.test(date)) {
      Alert.alert("Invalid date", "Date must be in YYYY-MM-DD format.");
      return;
    }
    if (!TIME_RE.test(time)) {
      Alert.alert("Invalid time", "Time must be in HH:MM format.");
      return;
    }
    const mins = parseInt(reminderBefore || "15", 10);
    if (isNaN(mins) || mins < 0) {
      Alert.alert("Invalid reminder", "Remind before must be a positive number.");
      return;
    }
    setSaving(true);
    try {
      await update(id, {
        title: title.trim(),
        subject: subject || undefined,
        date,
        time,
        reminder_before: mins,
        location: location || undefined,
        notes: notes || undefined,
      } as Partial<ClassEvent>);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Update failed", e?.message || "Could not update event.");
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background },
    content: { flex: 1, padding: t.spacing.md, paddingBottom: insets.bottom + 40 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    empty: { color: t.textSecondary },
    field: { marginBottom: t.spacing.md },
    label: {
      fontSize: t.font.sm,
      fontWeight: t.font.weight.semibold as any,
      color: t.textSecondary,
      marginBottom: t.spacing.xs + 2,
    },
    input: {
      backgroundColor: t.inputBg,
      borderWidth: 1,
      borderColor: t.inputBorder,
      borderRadius: t.radius.md,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm + 4,
      fontSize: t.font.md,
      color: t.text,
    },
    multiline: { height: 80, textAlignVertical: "top" },
    btn: {
      backgroundColor: t.primary,
      borderRadius: t.radius.md,
      paddingVertical: t.spacing.sm + 6,
      alignItems: "center",
      marginTop: t.spacing.sm,
      marginBottom: t.spacing.xxl,
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    btnText: {
      color: t.onPrimary,
      fontSize: t.font.lg,
      fontWeight: t.font.weight.bold as any,
    },
  });

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );

  if (!ready) {
    return (
      <View style={s.container}>
        <Header title="Edit class" showBack />
        <View style={s.center}>
          <Text style={s.empty}>{loading ? "Loading..." : "Event not found."}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <Header title="Edit class" showBack />
      <ScrollView style={s.content}>
        <Field label="Title">
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Subject">
          <TextInput
            style={s.input}
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Date (YYYY-MM-DD)">
          <TextInput
            style={s.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-07-15"
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Time (HH:MM)">
          <TextInput
            style={s.input}
            value={time}
            onChangeText={setTime}
            placeholder="10:00"
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Remind before (minutes)">
          <TextInput
            style={s.input}
            value={reminderBefore}
            onChangeText={setReminderBefore}
            keyboardType="number-pad"
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Location">
          <TextInput
            style={s.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Optional"
            placeholderTextColor={t.textTertiary}
          />
        </Field>
        <Field label="Notes">
          <TextInput
            style={[s.input, s.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            placeholderTextColor={t.textTertiary}
            multiline
            numberOfLines={3}
          />
        </Field>

        <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={t.onPrimary} />
          ) : (
            <Text style={s.btnText}>Update class</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
