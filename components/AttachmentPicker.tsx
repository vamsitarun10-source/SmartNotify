import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Image, Alert, ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import { pick } from "@react-native-documents/picker";
import { useAppTheme } from "../constants/ThemeContext";
import type { NoteAttachment } from "../services/notes";

interface Props {
  noteType: string;
  attachment: NoteAttachment | null;
  onAttachmentChange: (att: NoteAttachment | null) => void;
}

export default function AttachmentPicker({ noteType, attachment, onAttachmentChange }: Props) {
  const { theme: t } = useAppTheme();
  const [picking, setPicking] = useState(false);

  if (noteType === "text") return null;

  const pickImage = async () => {
    try {
      setPicking(true);
      const result = await launchImageLibrary({ mediaType: "photo", quality: 0.8 });
      setPicking(false);
      if (result.didCancel) return;
      if (result.errorCode === "camera_unavailable") { Alert.alert("Error", "Camera not available."); return; }
      if (result.errorMessage) { Alert.alert("Gallery Error", result.errorMessage); return; }
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      onAttachmentChange({
        filename: asset.fileName || "photo.jpg",
        type: "image",
        uri: asset.uri,
        mimeType: asset.type || "image/jpeg",
        size: asset.fileSize || 0,
        duration: 0,
      });
    } catch (e: any) {
      setPicking(false);
      Alert.alert("Error", e?.message || "Failed to pick image.");
    }
  };

  const pickPdf = async () => {
    try {
      setPicking(true);
      const result = await pick({ type: ["application/pdf"] });
      setPicking(false);
      if (!result || result.length === 0) return;
      const file = result[0];
      onAttachmentChange({
        filename: file.name || "document.pdf",
        type: "pdf",
        uri: file.uri,
        mimeType: file.type || "application/pdf",
        size: file.size || 0,
        duration: 0,
      });
    } catch (e: any) {
      setPicking(false);
      if (e?.code === "DOCUMENT_PICKER_CANCELED") return;
      Alert.alert("Error", "Could not select PDF. Please try again.");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const removeAttachment = () => onAttachmentChange(null);

  if (noteType === "image") {
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>Image</Text>
        {attachment?.uri ? (
          <View style={{ backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.sm, ...t.shadow.sm }}>
            <Image source={{ uri: attachment.uri }} style={{ width: "100%", height: 200, borderRadius: t.radius.md, marginBottom: t.spacing.sm }} resizeMode="cover" />
            <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginBottom: t.spacing.sm }}>{attachment.filename}{attachment.size ? ` (${formatFileSize(attachment.size)})` : ""}</Text>
            <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
              <TouchableOpacity style={[smBtn(t), { backgroundColor: t.primary }]} onPress={pickImage} activeOpacity={0.7}>
                <Ionicons name="images" size={16} color="#fff" />
                <Text style={smBtnText(t)}>Choose Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[smBtn(t), { backgroundColor: t.danger }]} onPress={removeAttachment} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={smBtnText(t)}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={pickerBtn(t)} onPress={pickImage} disabled={picking} activeOpacity={0.7}>
            {picking ? <ActivityIndicator color={t.primary} /> : <Ionicons name="image" size={32} color={t.primary} />}
            <Text style={pickerBtnText(t)}>{picking ? "Opening gallery..." : "Tap to select an image"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (noteType === "pdf") {
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 }}>PDF</Text>
        {attachment?.uri ? (
          <View style={{ backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.sm, ...t.shadow.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
              <Ionicons name="document" size={40} color={t.danger} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: t.font.md, fontWeight: "600", color: t.text }} numberOfLines={1}>{attachment.filename}</Text>
                {attachment.size ? <Text style={{ fontSize: t.font.sm, color: t.textSecondary }}>{formatFileSize(attachment.size)}</Text> : null}
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
              <TouchableOpacity style={[smBtn(t), { backgroundColor: t.primary }]} onPress={pickPdf} activeOpacity={0.7}>
                <Ionicons name="document" size={16} color="#fff" />
                <Text style={smBtnText(t)}>Choose Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[smBtn(t), { backgroundColor: t.danger }]} onPress={removeAttachment} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={smBtnText(t)}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={pickerBtn(t)} onPress={pickPdf} disabled={picking} activeOpacity={0.7}>
            {picking ? <ActivityIndicator color={t.danger} /> : <Ionicons name="document" size={32} color={t.danger} />}
            <Text style={pickerBtnText(t)}>{picking ? "Opening document picker..." : "Tap to select a PDF file"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
}

const pickerBtn = (t: any) => ({ alignItems: "center", justifyContent: "center", gap: t.spacing.sm, paddingVertical: 32, borderRadius: t.radius.lg, borderWidth: 2, borderColor: t.border, borderStyle: "dashed", backgroundColor: t.surfaceVariant });
const pickerBtnText = (t: any) => ({ fontSize: t.font.sm, color: t.textSecondary, textAlign: "center" as const });
const smBtn = (t: any) => ({ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: t.radius.md });
const smBtnText = (t: any) => ({ fontSize: t.font.xs, fontWeight: "600" as const, color: "#fff" });
