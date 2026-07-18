import React from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useAttendance } from "../hooks/useAttendance";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";

function getColor(pct: number, t: any): string {
  if (pct >= 75) return t.success;
  if (pct >= 70) return t.warning;
  return t.danger;
}

function getColorBg(pct: number, t: any): string {
  if (pct >= 75) return t.successContainer;
  if (pct >= 70) return t.warningContainer;
  return t.dangerContainer;
}

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const { summary, loading, error, refresh } = useAttendance();

  const overallTotal = summary.reduce((s, r) => s + r.total, 0);
  const overallAttended = summary.reduce((s, r) => s + r.attended, 0);
  const overallMissed = summary.reduce((s, r) => s + r.missed, 0);
  const overallMarked = overallAttended + overallMissed;
  const overallPct = overallMarked > 0 ? Math.round(overallAttended / overallMarked * 100) : 0;
  const overallCanSkip = summary.reduce((s, r) => s + r.can_skip, 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Attendance" />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Card */}
        <View style={[s.card(t), { backgroundColor: t.primaryContainer, borderColor: t.primary }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: t.font.sm, color: t.onPrimaryContainer }}>Overall Attendance</Text>
              <Text style={{ fontSize: t.font.hero, fontWeight: t.font.weight.bold, color: t.onPrimaryContainer, marginTop: 4 }}>
                {overallPct}%
              </Text>
            </View>
            <View style={[s.circle(t), { borderColor: getColor(overallPct, t) }]}>
              <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color: getColor(overallPct, t) }}>
                {overallPct}
              </Text>
              <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>%</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: t.spacing.md, marginTop: t.spacing.md }}>
            <StatChip icon="checkmark-circle" label="Attended" value={overallAttended} color={t.success} t={t} />
            <StatChip icon="close-circle" label="Missed" value={overallMissed} color={t.danger} t={t} />
            <StatChip icon="alert-circle" label="Can Skip" value={overallCanSkip} color={t.info} t={t} />
          </View>
        </View>

        {/* Per-subject Cards */}
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginTop: t.spacing.md, marginBottom: t.spacing.sm }}>
          By Subject
        </Text>

        {summary.length === 0 && !loading ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="analytics-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No attendance data yet</Text>
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: 4 }}>Mark classes as attended or missed to see stats</Text>
          </View>
        ) : null}

        {summary.map((item) => {
          const color = getColor(item.percentage, t);
          const colorBg = getColorBg(item.percentage, t);
          const marked = item.attended + item.missed;
          return (
            <View key={item.title} style={[s.card(t), { borderLeftColor: color, borderLeftWidth: 4 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.semibold, color: t.text }}>{item.title}</Text>
                  <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginTop: 2 }}>
                    {item.attended}/{marked} classes attended
                  </Text>
                </View>
                <View style={[s.badge(t), { backgroundColor: colorBg }]}>
                  <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color }}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={[s.barBg(t), { marginTop: t.spacing.sm }]}>
                <View style={[s.barFill(t), { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color }]} />
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: t.spacing.sm }}>
                <View style={{ flexDirection: "row", gap: t.spacing.md }}>
                  <MetaItem icon="checkmark-circle" value={item.attended} color={t.success} t={t} />
                  <MetaItem icon="close-circle" value={item.missed} color={t.danger} t={t} />
                  <MetaItem icon="help-circle" value={item.unmarked} color={t.textTertiary} t={t} />
                </View>
                {item.can_skip > 0 ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="shield-checkmark" size={14} color={color} />
                    <Text style={{ fontSize: t.font.xs, color, fontWeight: t.font.weight.semibold }}>
                      Skip {item.can_skip} more
                    </Text>
                  </View>
                ) : marked > 0 ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="warning" size={14} color={t.danger} />
                    <Text style={{ fontSize: t.font.xs, color: t.danger, fontWeight: t.font.weight.semibold }}>
                      Below 75%
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}

        {error ? (
          <Text style={{ color: t.danger, textAlign: "center", marginTop: t.spacing.md }}>{error}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, label, value, color, t }: { icon: string; label: string; value: number; color: string; t: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.onPrimaryContainer }}>
        {value}
      </Text>
      <Text style={{ fontSize: t.font.xs, color: t.onPrimaryContainer }}>{label}</Text>
    </View>
  );
}

function MetaItem({ icon, value, color, t }: { icon: string; value: number; color: string; t: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={{ fontSize: t.font.sm, color: t.textSecondary }}>{value}</Text>
    </View>
  );
}

const s = {
  card: (t: any) => ({
    backgroundColor: t.card,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.spacing.md,
    marginBottom: t.spacing.sm,
    ...t.shadow.sm,
  }),
  circle: (t: any) => ({
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  }),
  badge: (t: any) => ({
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs,
  }),
  barBg: (t: any) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: t.surfaceVariant,
    overflow: "hidden",
  }),
  barFill: (t: any) => ({
    height: "100%",
    borderRadius: 3,
  }),
};
