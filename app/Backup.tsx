import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useBackup } from "../hooks/useBackup";
import { listEvents } from "../services/events";
import { listTasks } from "../services/tasks";
import { listAssignments } from "../services/assignments";
import { listExams } from "../services/exams";
import { listCalendarEvents } from "../services/calendar";
import { listNotes } from "../services/notes";
import Header from "../components/Header";

export default function BackupScreen() {
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const { loading, error, lastBackup, importResult, loadLastBackupTime, exportData, importData } = useBackup();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadLastBackupTime();
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [e, ta, a, ex, cal, n] = await Promise.all([
        listEvents(), listTasks(), listAssignments(), listExams(), listCalendarEvents(), listNotes(),
      ]);
      setCounts({ events: e.length, tasks: ta.length, assignments: a.length, exams: ex.length, calendar: cal.length, notes: n.length });
    } catch {}
  };

  const onExport = async () => {
    try {
      const { blob, filename } = await exportData();
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await Share.share({
            message: reader.result as string,
            title: filename,
          });
        } catch {}
      };
      reader.readAsText(blob);
      loadCounts();
    } catch (e: any) {
      Alert.alert("Export failed", e?.message || "Try again.");
    }
  };

  const onImport = () => {
        Alert.alert("Import Data", "Paste your SmartNotify backup JSON below. This will merge with existing data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Import (Merge)",
        onPress: async () => {
          try {
            const result = await importData({}, false);
            Alert.alert("Import Complete", result.message);
            loadCounts();
          } catch {}
        },
      },
      {
        text: "Import (Replace All)",
        style: "destructive",
        onPress: async () => {
          Alert.alert("Warning", "This will DELETE all existing data and replace it with the backup. Continue?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Replace",
              style: "destructive",
              onPress: async () => {
                try {
                  const result = await importData({}, true);
                  Alert.alert("Import Complete", result.message);
                  loadCounts();
                } catch {}
              },
            },
          ]);
        },
      },
    ]);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const dataCategories = [
    { key: "events", label: "Classes", icon: "school", color: t.primary },
    { key: "tasks", label: "Tasks", icon: "checkbox", color: t.warning },
    { key: "assignments", label: "Assignments", icon: "document-text", color: "#FF7043" },
    { key: "exams", label: "Exams", icon: "school", color: t.danger },
    { key: "calendar", label: "Calendar", icon: "calendar", color: t.secondary },
    { key: "notes", label: "Notes", icon: "document-text", color: t.info },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Backup & Restore" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={[card(t), { borderColor: t.danger, borderLeftWidth: 4 }]}>
            <Text style={{ fontSize: t.font.sm, color: t.danger }}>{error}</Text>
          </View>
        ) : null}

        {importResult ? (
          <View style={[card(t), { borderColor: t.success, borderLeftWidth: 4 }]}>
            <Text style={{ fontSize: t.font.sm, color: t.success }}>{importResult.message}</Text>
          </View>
        ) : null}

        {/* Data Summary */}
        <View style={card(t)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.md }}>
            <Ionicons name="analytics" size={20} color={t.primary} />
            <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Data Summary</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.sm }}>
            {dataCategories.map((cat) => (
              <View key={cat.key} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: cat.color + "12", paddingHorizontal: 10, paddingVertical: 6, borderRadius: t.radius.full }}>
                <Ionicons name={cat.icon as any} size={14} color={cat.color} />
                <Text style={{ fontSize: t.font.sm, fontWeight: "600", color: t.text }}>{counts[cat.key] || 0}</Text>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{cat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Export */}
        <View style={card(t)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.primaryContainer, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="cloud-upload" size={20} color={t.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>Export Data</Text>
              <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>Download all data as JSON</Text>
            </View>
          </View>
          <Text style={{ fontSize: t.font.xs, color: t.textTertiary, marginBottom: t.spacing.sm }}>Last backup: {formatDate(lastBackup)}</Text>
          <TouchableOpacity style={[btn(t), { opacity: loading ? 0.6 : 1 }]} onPress={onExport} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                <Ionicons name="download" size={18} color="#fff" />
                <Text style={btnText(t)}>Export Backup</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Import */}
        <View style={card(t)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.warningContainer, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="cloud-download" size={20} color={t.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>Import Data</Text>
              <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>Restore from a backup file</Text>
            </View>
          </View>
          <TouchableOpacity style={[btn(t), { backgroundColor: t.warning, opacity: loading ? 0.6 : 1 }]} onPress={onImport} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
                <Ionicons name="upload" size={18} color="#fff" />
                <Text style={btnText(t)}>Import Backup</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Google Drive Placeholder */}
        <View style={[card(t), { opacity: 0.6 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.surfaceVariant, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="cloud" size={20} color={t.textTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.textSecondary }}>Google Drive Sync</Text>
              <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>Auto backup to Google Drive — coming soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const card = (t: any) => ({
  backgroundColor: t.card,
  borderRadius: t.radius.lg,
  borderWidth: 1,
  borderColor: t.cardBorder,
  padding: t.spacing.md,
  marginBottom: t.spacing.md,
  ...t.shadow.sm,
});
const btn = (t: any) => ({
  backgroundColor: t.primary,
  borderRadius: t.radius.lg,
  paddingVertical: 14,
  alignItems: "center" as const,
});
const btnText = (t: any) => ({ color: "#fff", fontSize: t.font.md, fontWeight: "700" as const });
