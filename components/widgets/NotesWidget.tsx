import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { notes: any[] };

export default function NotesWidget({ notes }: Props) {
  const { theme: t } = useAppTheme();
  if (!notes.length) {
    return <Text style={{ fontSize: t.font.sm, color: t.textTertiary, textAlign: "center", paddingVertical: t.spacing.sm }}>No recent notes</Text>;
  }
  const typeIcons: Record<string, string> = { text: "document-text", image: "image", pdf: "document", voice: "mic" };
  return (
    <View>
      {notes.slice(0, 3).map((n) => (
        <View key={n.id} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingVertical: 6 }}>
          <View style={{ width: 32, height: 32, borderRadius: t.radius.sm, backgroundColor: t.secondaryContainer, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={(typeIcons[n.note_type] || "document-text") as any} size={16} color={t.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>{n.title}</Text>
            {n.subject ? <Text style={{ fontSize: t.font.xs, color: t.secondary }}>{n.subject}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
