import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useNotes } from "../hooks/useNotes";
import Header from "../components/Header";
import AttachmentPicker from "../components/AttachmentPicker";
import type { NoteAttachment } from "../services/notes";

const NOTE_TYPES = [
  { key: "text", label: "Text", icon: "document-text" },
  { key: "image", label: "Image", icon: "image" },
  { key: "pdf", label: "PDF", icon: "document" },
  { key: "voice", label: "Voice", icon: "mic" },
];

export default function EditNoteScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const id = route.params?.id;
  const { notes, update, toggle, loading } = useNotes();
  const { theme: t } = useAppTheme();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [noteType, setNoteType] = useState("text");
  const [attachment, setAttachment] = useState<NoteAttachment | null>(null);
  const [pinned, setPinned] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && notes.length && !ready) {
      const found = notes.find((n) => n.id === id);
      if (found) {
        setTitle(found.title); setContent(found.content); setSubject(found.subject);
        setNoteType(found.note_type); setPinned(found.pinned);
        if (found.attachments.length > 0) setAttachment(found.attachments[0]);
        setReady(true);
      }
    }
  }, [id, notes, ready]);

  const onSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing title", "Please enter a note title."); return; }
    if (noteType !== "text" && !attachment) { Alert.alert("Missing attachment", "Please select an attachment."); return; }
    setSaving(true);
    try {
      const attachments = attachment ? [attachment] : [];
      await update(id, {
        title: title.trim(), content, subject: subject.trim(),
        note_type: noteType, attachments, pinned,
      });
      navigation.goBack();
    } catch (e: any) { Alert.alert("Error", e?.message || "Could not update note."); }
    finally { setSaving(false); }
  };

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: t.background }}><Header title="Edit Note" showBack /><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Text style={{ color: t.textSecondary }}>{loading ? "Loading..." : "Not found."}</Text></View></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Edit Note" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 40 }}>
        <Field label="Title"><TextInput style={input(t)} value={title} onChangeText={setTitle} /></Field>
        <Field label="Subject"><TextInput style={input(t)} value={subject} onChangeText={setSubject} /></Field>

        <Field label="Type">
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {NOTE_TYPES.map((nt) => (
              <TouchableOpacity
                key={nt.key}
                style={[typeBtn(t), noteType === nt.key && { backgroundColor: t.primary, borderColor: t.primary }]}
                onPress={() => { setNoteType(nt.key); setAttachment(null); }}
                activeOpacity={0.7}
              >
                <Ionicons name={nt.icon as any} size={18} color={noteType === nt.key ? "#fff" : t.textSecondary} />
                <Text style={[typeBtnText(t), noteType === nt.key && { color: "#fff" }]}>{nt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {noteType === "text" ? (
          <Field label="Content">
            <TextInput
              style={[input(t), { height: 200, textAlignVertical: "top" }]}
              value={content} onChangeText={setContent}
              multiline numberOfLines={10}
            />
          </Field>
        ) : (
          <AttachmentPicker noteType={noteType} attachment={attachment} onAttachmentChange={setAttachment} />
        )}

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.md }}
          onPress={() => { setPinned(!pinned); toggle(id); }}
          activeOpacity={0.7}
        >
          <Ionicons name={pinned ? "star" : "star-outline"} size={22} color={pinned ? t.warning : t.textTertiary} />
          <Text style={{ fontSize: t.font.md, color: t.text }}>{pinned ? "Pinned" : "Pin this note"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[btn(t), { opacity: saving ? 0.6 : 1 }]}
          onPress={onSubmit} disabled={saving} activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={btnText(t)}>Update Note</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={{ marginBottom: 14 }}><Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>{label}</Text>{children}</View>;
}
const input = (t: any) => ({ backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: t.text });
const typeBtn = (t: any) => ({ flex: 1, alignItems: "center", gap: 4, paddingVertical: t.spacing.sm, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.border, backgroundColor: t.surfaceVariant });
const typeBtnText = (t: any) => ({ fontSize: t.font.xs, fontWeight: "600" as const, color: t.textSecondary });
const btn = (t: any) => ({ backgroundColor: t.primary, borderRadius: t.radius.lg, paddingVertical: 14, alignItems: "center" as const, marginTop: 8 });
const btnText = (t: any) => ({ color: "#fff", fontSize: 16, fontWeight: "700" as const });
