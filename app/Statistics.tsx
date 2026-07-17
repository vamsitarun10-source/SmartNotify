import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useStats } from "../hooks/useStats";
import BarChart from "../components/charts/BarChart";
import CircularProgress from "../components/charts/CircularProgress";
import LineChart from "../components/charts/LineChart";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatisticsScreen() {
  const { theme: t } = useAppTheme();
  const { stats, loading, error, refresh } = useStats();

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Statistics" />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={{ color: t.danger, marginBottom: t.spacing.sm }}>{error}</Text> : null}
        {!stats && !loading ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="stats-chart-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No data yet</Text>
          </View>
        ) : null}
        {stats ? (
          <>
            {/* Productivity + Study Hours */}
            <View style={[card(t), { flexDirection: "row", justifyContent: "space-around", alignItems: "center" }]}>
              <CircularProgress value={stats.productivity} size={110} strokeWidth={10} color={stats.productivity >= 70 ? t.success : stats.productivity >= 40 ? t.warning : t.danger} label="Productivity" theme={t} />
              <View style={{ alignItems: "center", gap: 4 }}>
                <View style={[iconCircle(t), { backgroundColor: t.info + "20" }]}>
                  <Ionicons name="book" size={24} color={t.info} />
                </View>
                <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: t.text }}>{stats.study_hours}</Text>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>Study Hours</Text>
              </View>
            </View>

            {/* Attendance */}
            <SectionTitle t={t} icon="pie-chart" title="Attendance" />
            <View style={card(t)}>
              <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: t.spacing.md }}>
                <StatCircle value={stats.attendance.attended} label="Attended" color={t.success} t={t} />
                <StatCircle value={stats.attendance.missed} label="Missed" color={t.danger} t={t} />
                <StatCircle value={stats.attendance.unmarked} label="Unmarked" color={t.textTertiary} t={t} />
              </View>
              <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: t.surfaceVariant }}>
                {stats.attendance.attended > 0 ? <View style={{ flex: stats.attendance.attended, backgroundColor: t.success }} /> : null}
                {stats.attendance.missed > 0 ? <View style={{ flex: stats.attendance.missed, backgroundColor: t.danger }} /> : null}
                {stats.attendance.unmarked > 0 ? <View style={{ flex: stats.attendance.unmarked, backgroundColor: t.textTertiary }} /> : null}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: t.spacing.sm }}>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{stats.attendance.total} total classes</Text>
                {stats.attendance.can_skip > 0 ? (
                  <Text style={{ fontSize: t.font.xs, color: t.success, fontWeight: "600" }}>Can skip {stats.attendance.can_skip} more</Text>
                ) : stats.attendance.total > 0 ? (
                  <Text style={{ fontSize: t.font.xs, color: t.danger, fontWeight: "600" }}>Below 75%</Text>
                ) : null}
              </View>
            </View>

            {/* Completed Tasks */}
            <SectionTitle t={t} icon="checkbox" title="Completed Tasks" />
            <View style={card(t)}>
              <BarChart
                data={[
                  { label: "Tasks Done", value: stats.tasks.completed, color: t.success },
                  { label: "Tasks Pending", value: stats.tasks.pending, color: t.warning },
                ]}
                theme={t}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: t.spacing.sm }}>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{stats.tasks.completed}/{stats.tasks.total} completed</Text>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{stats.tasks.total > 0 ? Math.round(stats.tasks.completed / stats.tasks.total * 100) : 0}%</Text>
              </View>
            </View>

            {/* Missed Classes */}
            <SectionTitle t={t} icon="alert-circle" title="Missed Classes" />
            <View style={card(t)}>
              <BarChart
                data={[
                  { label: "Attended", value: stats.attendance.attended, color: t.success },
                  { label: "Missed", value: stats.attendance.missed, color: t.danger },
                  { label: "Unmarked", value: stats.attendance.unmarked, color: t.textTertiary },
                ]}
                theme={t}
              />
            </View>

            {/* Weekly Progress */}
            <SectionTitle t={t} icon="trending-up" title="Weekly Progress" />
            <View style={card(t)}>
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text, marginBottom: t.spacing.sm }}>Classes Attended</Text>
              <LineChart labels={DAY_LABELS} values={stats.weekly.classes} color={t.primary} theme={t} />
            </View>
            <View style={card(t)}>
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text, marginBottom: t.spacing.sm }}>Tasks Completed</Text>
              <LineChart labels={DAY_LABELS} values={stats.weekly.tasks} color={t.secondary} theme={t} />
            </View>

            {/* Monthly Progress */}
            <SectionTitle t={t} icon="calendar" title="Monthly Progress" />
            <View style={card(t)}>
              <BarChart
                data={[
                  { label: "Classes Total", value: stats.monthly.classes_total, color: t.primary },
                  { label: "Classes Attended", value: stats.monthly.classes_attended, color: t.success },
                  { label: "Tasks Done", value: stats.monthly.tasks_completed, color: t.secondary },
                  { label: "Assignments Done", value: stats.monthly.assignments_completed, color: t.warning },
                ]}
                theme={t}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ t, icon, title }: { t: any; icon: string; title: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: t.spacing.md, marginBottom: t.spacing.sm }}>
      <Ionicons name={icon as any} size={18} color={t.primary} />
      <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>{title}</Text>
    </View>
  );
}

function StatCircle({ value, label, color, t }: { value: number; label: string; color: string; t: any }) {
  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color }}>{value}</Text>
      </View>
      <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{label}</Text>
    </View>
  );
}

function iconCircle(t: any) {
  return { width: 48, height: 48, borderRadius: 24, alignItems: "center" as const, justifyContent: "center" as const };
}

const card = (t: any) => ({
  backgroundColor: t.card,
  borderRadius: t.radius.lg,
  borderWidth: 1,
  borderColor: t.cardBorder,
  padding: t.spacing.md,
  marginBottom: t.spacing.sm,
  ...t.shadow.sm,
});
