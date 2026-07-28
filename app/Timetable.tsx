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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useTimetable } from "../hooks/useTimetable";
import { useEvents } from "../hooks/useEvents";
import { DAY_NAMES } from "../services/timetable";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";

function Field({ label, children, fieldStyle, labelStyle }: {
  label: string;
  children: React.ReactNode;
  fieldStyle: any;
  labelStyle: any;
}) {
  return (
    <View style={fieldStyle}>
      <Text style={labelStyle}>{label}</Text>
      {children}
    </View>
  );
}

export default function TimetableScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { entries, loading, error, create, remove, generate } = useTimetable();
  const { refresh: refreshEvents } = useEvents();
  const { theme: t } = useAppTheme();

  const [adding, setAdding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [time, setTime] = useState("09:00");
  const [reminderBefore, setReminderBefore] = useState("15");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const onAdd = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a class name.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("Invalid time", "Time must be in HH:MM format.");
      return;
    }
    const mins = parseInt(reminderBefore || "15", 10);
    if (isNaN(mins) || mins < 0) {
      Alert.alert("Invalid reminder", "Must be a positive number.");
      return;
    }
    setSaving(true);
    try {
      await create({
        title: title.trim(),
        subject: subject || undefined,
        day_of_week: dayOfWeek,
        time,
        duration_minutes: 60,
        reminder_before: mins,
        location: location || undefined,
        notes: notes || undefined,
      });
      setTitle("");
      setSubject("");
      setTime("09:00");
      setReminderBefore("15");
      setLocation("");
      setNotes("");
      setAdding(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not add entry.");
    } finally {
      setSaving(false);
    }
  };

  const onGenerate = async () => {
    Alert.alert(
      "Generate schedule",
      "This will create events for the next 4 weeks based on your timetable. Existing events won't be duplicated. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            setGenerating(true);
            try {
              const result = await generate(4);
              await refreshEvents();
              Alert.alert("Done", result.message);
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Could not generate events.");
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const onDelete = (entry: any) => {
    Alert.alert("Remove", `Remove "${entry.title}" from timetable?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => remove(entry.id),
      },
    ]);
  };

  const grouped = DAY_NAMES.map((name, i) => ({
    name,
    entries: entries.filter((e) => e.day_of_week === i),
  }));

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: t.background },
    content: { flex: 1, padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 },
    form: {
      backgroundColor: t.card,
      borderRadius: t.radius.lg,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.cardBorder,
      marginBottom: t.spacing.md,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    formTitle: {
      fontSize: t.font.lg,
      fontWeight: t.font.weight.bold as any,
      color: t.text,
      marginBottom: t.spacing.md,
    },
    field: { marginBottom: t.spacing.sm + 4 },
    label: {
      fontSize: t.font.sm,
      fontWeight: t.font.weight.semibold as any,
      color: t.textSecondary,
      marginBottom: t.spacing.xs,
    },
    input: {
      backgroundColor: t.inputBg,
      borderWidth: 1,
      borderColor: t.inputBorder,
      borderRadius: t.radius.sm + 4,
      paddingHorizontal: t.spacing.sm + 4,
      paddingVertical: t.spacing.sm + 2,
      fontSize: t.font.md,
      color: t.text,
    },
    multiline: { height: 60, textAlignVertical: "top" },
    dayRow: { flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs + 2 },
    dayChip: {
      paddingHorizontal: t.spacing.sm + 4,
      paddingVertical: t.spacing.xs + 2,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.inputBg,
    },
    dayChipActive: { backgroundColor: t.primary, borderColor: t.primary },
    dayText: { fontSize: t.font.sm, color: t.textSecondary, fontWeight: t.font.weight.semibold as any },
    dayTextActive: { color: t.onPrimary },
    saveBtn: {
      backgroundColor: t.primary,
      borderRadius: t.radius.sm + 4,
      paddingVertical: t.spacing.sm + 4,
      alignItems: "center",
      marginTop: t.spacing.xs,
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    saveBtnText: { color: t.onPrimary, fontSize: t.font.md, fontWeight: t.font.weight.bold as any },
    daySection: { marginBottom: t.spacing.md },
    dayTitle: {
      fontSize: t.font.lg,
      fontWeight: t.font.weight.bold as any,
      color: t.text,
      marginBottom: t.spacing.sm,
    },
    entryCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: t.radius.md,
      padding: t.spacing.sm + 4,
      marginBottom: t.spacing.xs + 2,
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    entryInfo: { flex: 1 },
    entryTitle: { fontSize: t.font.lg - 1, fontWeight: t.font.weight.semibold as any, color: t.text },
    entrySubject: { fontSize: t.font.sm, color: t.primary, marginTop: 2 },
    entryMeta: { flexDirection: "row", alignItems: "center", marginTop: t.spacing.xs },
    entryMetaText: { fontSize: t.font.sm, color: t.textSecondary, marginLeft: 4 },
    deleteBtn: { padding: t.spacing.sm, marginLeft: t.spacing.sm },
    generateBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.secondary,
      borderRadius: t.radius.md,
      paddingVertical: t.spacing.sm + 6,
      marginTop: t.spacing.sm,
      gap: t.spacing.sm,
    },
    generateBtnText: { color: t.onPrimaryContainer || t.onPrimary, fontSize: t.font.lg - 1, fontWeight: t.font.weight.bold as any },
    empty: { color: t.textSecondary, marginTop: t.spacing.sm },
    error: { color: t.danger, marginTop: t.spacing.sm },
    emptyState: { alignItems: "center", marginTop: 60 },
    emptyTitle: {
      fontSize: t.font.xl,
      fontWeight: t.font.weight.bold as any,
      color: t.text,
      marginTop: t.spacing.md,
    },
    emptySubtitle: {
      fontSize: t.font.sm,
      color: t.textSecondary,
      marginTop: t.spacing.xs + 4,
      textAlign: "center",
      paddingHorizontal: t.spacing.xl,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 5,
    },
  });

  return (
    <View style={s.container}>
      <Header title="Timetable" />
      <OfflineBanner />
      <ScrollView style={s.content}>
        {adding && (
          <View style={s.form}>
            <Text style={s.formTitle}>Add recurring class</Text>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Class name">
              <TextInput
                style={s.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Math 101"
                placeholderTextColor={t.textTertiary}
              />
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Subject">
              <TextInput
                style={s.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Optional"
                placeholderTextColor={t.textTertiary}
              />
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Day of week">
              <View style={s.dayRow}>
                {DAY_NAMES.map((d, i) => (
                  <TouchableOpacity
                    key={d}
                    style={[s.dayChip, dayOfWeek === i && s.dayChipActive]}
                    onPress={() => setDayOfWeek(i)}
                  >
                    <Text style={[s.dayText, dayOfWeek === i && s.dayTextActive]}>
                      {d.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Time (HH:MM)">
              <TextInput
                style={s.input}
                value={time}
                onChangeText={setTime}
                placeholder="10:00"
                placeholderTextColor={t.textTertiary}
              />
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Remind before (minutes)">
              <TextInput
                style={s.input}
                value={reminderBefore}
                onChangeText={setReminderBefore}
                keyboardType="number-pad"
                placeholderTextColor={t.textTertiary}
              />
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Location">
              <TextInput
                style={s.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Optional"
                placeholderTextColor={t.textTertiary}
              />
            </Field>
            <Field fieldStyle={s.field} labelStyle={s.label} label="Notes">
              <TextInput
                style={[s.input, s.multiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional"
                placeholderTextColor={t.textTertiary}
                multiline
                numberOfLines={2}
              />
            </Field>
            <TouchableOpacity
              style={s.saveBtn}
              onPress={onAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={t.onPrimary} />
              ) : (
                <Text style={s.saveBtnText}>Add to timetable</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading && <Text style={s.empty}>Loading...</Text>}
        {error && <Text style={s.error}>{error}</Text>}

        {grouped.map((group) =>
          group.entries.length > 0 ? (
            <View key={group.name} style={s.daySection}>
              <Text style={s.dayTitle}>{group.name}</Text>
              {group.entries.map((entry) => (
                <View key={entry.id} style={s.entryCard}>
                  <View style={s.entryInfo}>
                    <Text style={s.entryTitle}>{entry.title}</Text>
                    {entry.subject ? (
                      <Text style={s.entrySubject}>{entry.subject}</Text>
                    ) : null}
                    <View style={s.entryMeta}>
                      <Ionicons name="time-outline" size={14} color={t.textSecondary} />
                      <Text style={s.entryMetaText}>{entry.time}</Text>
                      {entry.location ? (
                        <>
                          <Ionicons name="location-outline" size={14} color={t.textSecondary} style={{ marginLeft: 10 }} />
                          <Text style={s.entryMetaText}>{entry.location}</Text>
                        </>
                      ) : null}
                      <Ionicons name="alarm-outline" size={14} color={t.textSecondary} style={{ marginLeft: 10 }} />
                      <Text style={s.entryMetaText}>{entry.reminder_before}m before</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(entry)}>
                    <Ionicons name="trash-outline" size={20} color={t.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null
        )}

        {!loading && entries.length === 0 && !adding && (
          <View style={s.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={t.textSecondary} />
            <Text style={s.emptyTitle}>No timetable yet</Text>
            <Text style={s.emptySubtitle}>
              Tap + to add your weekly classes, then generate the schedule.
            </Text>
          </View>
        )}

        {entries.length > 0 && (
          <TouchableOpacity
            style={s.generateBtn}
            onPress={onGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={t.onPrimaryContainer || t.onPrimary} />
            ) : (
              <>
                <Ionicons name="flash" size={20} color={t.onPrimaryContainer || t.onPrimary} />
                <Text style={s.generateBtnText}>Generate 4-week schedule</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <AnimatedFAB
        onPress={() => setAdding(!adding)}
        backgroundColor={t.primary}
        entranceDelay={400}
        icon={adding ? "close" : "add"}
        style={{ position: 'absolute', right: 16, bottom: 60 + insets.bottom + 16, zIndex: 100 }}
      />
    </View>
  );
}
