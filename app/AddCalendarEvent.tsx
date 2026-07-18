import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useCalendarEvents } from "../hooks/useCalendar";
import Header from "../components/Header";

const CATEGORIES = [
  { key: "holiday", label: "Holiday", icon: "star", colorKey: "secondary" },
  { key: "personal", label: "Personal", icon: "person", colorKey: "info" },
];

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function AddCalendarEventScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { create } = useCalendarEvents();
  const { theme: t } = useAppTheme();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(route.params?.date || todayStr());
  const [category, setCategory] = useState("personal");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter a title."); return; }
    setSaving(true);
    try {
      await create({ title: title.trim(), date, category, notes });
      navigation.goBack();
    } catch (e: any) { Alert.alert("Error", e?.message || "Could not create event."); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Add Event" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 40 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} placeholder="e.g. Holiday" placeholderTextColor={t.textTertiary} /></Field>

        <Field label="Category">
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {CATEGORIES.map((cat) => {
              const c = (t as any)[cat.colorKey] || t.primary;
              const active = category === cat.key;
              return (
                <TouchableOpacity key={cat.key} style={[chip(t), active && { backgroundColor: c, borderColor: c }]} onPress={() => setCategory(cat.key)} activeOpacity={0.7}>
                  <Ionicons name={cat.icon as any} size={14} color={active ? "#fff" : c} />
                  <Text style={[chipText(t), active && { color: "#fff" }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <Field label="Date"><TextInput style={input(t)} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={t.textTertiary} /></Field>
        <Field label="Notes"><TextInput style={[input(t), { height: 80, textAlignVertical: "top" }]} value={notes} onChangeText={setNotes} placeholder="Optional" placeholderTextColor={t.textTertiary} multiline numberOfLines={3} /></Field>

        <TouchableOpacity style={[btn(t), { opacity: saving ? 0.6 : 1 }]} onPress={onSubmit} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Save Event</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ marginBottom: 14 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>{label}</Text>{children}</View>;
}
const input = (t: any) => ({ backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: t.text });
const chip = (t: any) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surfaceVariant });
const chipText = (t: any) => ({ fontSize: 13, fontWeight: "600" as const, color: t.textSecondary });
const btn = (t: any) => ({ backgroundColor: t.primary, borderRadius: t.radius.lg, paddingVertical: 14, alignItems: "center" as const, marginTop: 8 });
const btnText = (t: any) => ({ color: "#fff", fontSize: 16, fontWeight: "700" as const });
