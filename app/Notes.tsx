import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, RefreshControl, Image, Linking, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useNotes } from "../hooks/useNotes";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";
import type { Note, NoteAttachment } from "../services/notes";

type NoteFilter = "all" | "pinned" | "text" | "image" | "pdf" | "voice";
const FILTERS: { key: NoteFilter; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "layers" },
  { key: "pinned", label: "Pinned", icon: "star" },
  { key: "text", label: "Text", icon: "document-text" },
  { key: "image", label: "Image", icon: "image" },
  { key: "pdf", label: "PDF", icon: "document" },
  { key: "voice", label: "Voice", icon: "mic" },
];

const TYPE_ICONS: Record<string, string> = {
  text: "document-text", image: "image", pdf: "document", voice: "mic",
};

export default function NotesScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {
    notes, subjects, loading, error,
    searchQuery, filterSubject,
    refresh, doSearch, remove,
  } = useNotes();
  const { theme: t } = useAppTheme();
  const [typeFilter, setTypeFilter] = useState<NoteFilter>("all");
  const [search, setSearch] = useState(searchQuery);
  const [imageViewer, setImageViewer] = useState<{ uri: string; title: string } | null>(null);

  const filtered = notes.filter((n) => {
    if (typeFilter === "pinned") return n.pinned;
    if (typeFilter !== "all" && n.note_type !== typeFilter) return false;
    return true;
  });

  const onDelete = (note: any) => {
    Alert.alert("Delete", `Delete "${note.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove(note.id) },
    ]);
  };

  const onSearch = () => doSearch(search, filterSubject || undefined);

  const openAttachment = (note: Note, att: NoteAttachment) => {
    if (!att.uri) return;
    if (att.type === "image") {
      setImageViewer({ uri: att.uri, title: note.title });
    } else if (att.type === "pdf") {
      Linking.openURL(att.uri).catch(() => Alert.alert("Error", "Could not open PDF."));
    } else if (att.type === "voice") {
      Linking.openURL(att.uri).catch(() => Alert.alert("Error", "Could not play audio."));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Notes" showAdd onAdd={() => navigation.navigate("AddNote")} />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refresh()} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={{ flexDirection: "row", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.inputBorder, paddingHorizontal: t.spacing.sm }}>
            <Ionicons name="search" size={18} color={t.textTertiary} />
            <TextInput
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: t.spacing.sm, fontSize: t.font.md, color: t.text }}
              placeholder="Search notes..."
              placeholderTextColor={t.textTertiary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSearch}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity onPress={() => { setSearch(""); doSearch(""); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={t.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Subject filter chips */}
        {subjects.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: t.spacing.sm }}>
            <View style={{ flexDirection: "row", gap: t.spacing.xs }}>
              <TouchableOpacity
                style={[chip(t), !filterSubject && { backgroundColor: t.primary, borderColor: t.primary }]}
                onPress={() => doSearch(search)}
                activeOpacity={0.7}
              >
                <Text style={[chipText(t), !filterSubject && { color: "#fff" }]}>All</Text>
              </TouchableOpacity>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[chip(t), filterSubject === s && { backgroundColor: t.primary, borderColor: t.primary }]}
                  onPress={() => doSearch(search, s)}
                  activeOpacity={0.7}
                >
                  <Text style={[chipText(t), filterSubject === s && { color: "#fff" }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : null}

        {/* Type filter chips */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[typeChip(t), typeFilter === f.key && { backgroundColor: t.primary, borderColor: t.primary }]}
              onPress={() => setTypeFilter(f.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={f.icon as any} size={13} color={typeFilter === f.key ? "#fff" : t.textSecondary} />
              <Text style={[typeChipText(t), typeFilter === f.key && { color: "#fff" }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && !error.includes("Offline") ? (
          <Text style={{ color: t.danger, marginBottom: t.spacing.sm }}>{error}</Text>
        ) : null}
        {error?.includes("Offline") ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.warningContainer, borderRadius: t.radius.md, padding: t.spacing.sm, marginBottom: t.spacing.sm }}>
            <Ionicons name="cloud-offline" size={16} color={t.warning} />
            <Text style={{ fontSize: t.font.sm, color: t.warning }}>{error}</Text>
          </View>
        ) : null}

        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="document-text-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No notes yet</Text>
          </View>
        ) : (
          filtered.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[card(t)]}
              onPress={() => navigation.navigate("EditNote", { id: note.id })}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: t.spacing.sm }}>
                <View style={[typeIcon(t), { backgroundColor: t.primaryContainer }]}>
                  <Ionicons name={(TYPE_ICONS[note.note_type] || "document-text") as any} size={18} color={t.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
                    <Text style={[titleStyle(t)]} numberOfLines={1}>{note.title}</Text>
                    {note.pinned ? <Ionicons name="star" size={14} color={t.warning} /> : null}
                  </View>
                  {note.content ? (
                    <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginTop: 2 }} numberOfLines={2}>{note.content}</Text>
                  ) : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: 6 }}>
                    {note.subject ? (
                      <View style={{ backgroundColor: t.secondaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: t.radius.full }}>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: t.secondary }}>{note.subject}</Text>
                      </View>
                    ) : null}
                    <View style={{ backgroundColor: t.surfaceVariant, paddingHorizontal: 6, paddingVertical: 2, borderRadius: t.radius.full }}>
                      <Text style={{ fontSize: 10, fontWeight: "500", color: t.textTertiary }}>{note.note_type}</Text>
                    </View>
                    {note.attachments.length > 0 ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                        <Ionicons name="attach" size={12} color={t.textTertiary} />
                        <Text style={{ fontSize: 10, color: t.textTertiary }}>{note.attachments.length}</Text>
                      </View>
                    ) : null}
                  </View>
                  {/* Attachment indicators */}
                  {note.attachments.map((att, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.surfaceVariant, borderRadius: t.radius.md, padding: t.spacing.sm, marginTop: t.spacing.sm }}
                      onPress={() => openAttachment(note, att)}
                      activeOpacity={0.7}
                    >
                      {att.type === "image" ? (
                        <>
                          <Ionicons name="image" size={18} color={t.primary} />
                          <Text style={{ fontSize: t.font.xs, color: t.textSecondary, flex: 1 }} numberOfLines={1}>🖼 {att.filename}</Text>
                          {att.uri ? <Ionicons name="eye-outline" size={16} color={t.primary} /> : null}
                        </>
                      ) : att.type === "pdf" ? (
                        <>
                          <Ionicons name="document" size={18} color={t.danger} />
                          <Text style={{ fontSize: t.font.xs, color: t.textSecondary, flex: 1 }} numberOfLines={1}>📄 {att.filename}{att.size ? ` (${formatFileSize(att.size)})` : ""}</Text>
                          {att.uri ? <Ionicons name="open-outline" size={16} color={t.primary} /> : null}
                        </>
                      ) : att.type === "voice" ? (
                        <>
                          <Ionicons name="mic" size={18} color={t.primary} />
                          <Text style={{ fontSize: t.font.xs, color: t.textSecondary, flex: 1 }} numberOfLines={1}>🎤 Voice Note{att.duration ? ` (${formatDuration(att.duration)})` : ""}</Text>
                          {att.uri ? <Ionicons name="play-circle" size={16} color={t.primary} /> : null}
                        </>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => onDelete(note)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Image viewer overlay */}
      {imageViewer ? (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.95)", zIndex: 1000, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={{ position: "absolute", top: 60, right: 20, zIndex: 1001 }} onPress={() => setImageViewer(null)} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={{ position: "absolute", top: 60, left: 20, color: "#fff", fontSize: 16, fontWeight: "600" }} numberOfLines={1}>{imageViewer.title}</Text>
          <Image source={{ uri: imageViewer.uri }} style={{ width: "90%", height: "70%", borderRadius: 12 }} resizeMode="contain" />
        </View>
      ) : null}

      <AnimatedFAB
        onPress={() => navigation.navigate("AddNote")}
        backgroundColor={t.primary}
        entranceDelay={400}
        style={{ position: 'absolute', right: 16, bottom: 60 + insets.bottom + 16, zIndex: 100 }}
        accessibilityLabel="Add new note"
        accessibilityHint="Opens the add note form"
        accessibilityRole="button"
      />
    </View>
  );
}

function formatDuration(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const chip = (t: any) => ({ paddingHorizontal: 12, paddingVertical: 6, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface });
const chipText = (t: any) => ({ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary });
const typeChip = (t: any) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface });
const typeChipText = (t: any) => ({ fontSize: t.font.xs, fontWeight: "600" as const, color: t.textSecondary });
const card = (t: any) => ({ backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.sm, ...t.shadow.sm });
const typeIcon = (t: any) => ({ width: 36, height: 36, borderRadius: t.radius.md, alignItems: "center" as const, justifyContent: "center" as const });
const titleStyle = (t: any) => ({ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text, flex: 1 });
