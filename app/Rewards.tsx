import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useRewards } from "../hooks/useRewards";
import Header from "../components/Header";
import DashboardCard from "../components/DashboardCard";
import { SkeletonList, SkeletonStatRow } from "../components/SkeletonLoader";

function LevelBadge({ level, xp, xpToNext, t }: { level: number; xp: number; xpToNext: number; t: any }) {
  const progress = xpToNext > 0 ? ((100 - xpToNext) / 100) : 1;
  return (
    <View style={{ alignItems: "center", paddingVertical: t.spacing.lg }}>
      <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: t.primary, backgroundColor: t.primaryContainer, alignItems: "center", justifyContent: "center", marginBottom: t.spacing.sm }}>
        <Text style={{ fontSize: 32, fontWeight: "800", color: t.primary }}>{level}</Text>
      </View>
      <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Level {level}</Text>
      <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginTop: 2 }}>{xp} XP total — {xpToNext} to next level</Text>
      <View style={{ width: "80%", height: 8, borderRadius: 4, backgroundColor: t.surfaceVariant, overflow: "hidden", marginTop: t.spacing.sm }}>
        <View style={{ height: "100%", width: `${progress * 100}%`, borderRadius: 4, backgroundColor: t.primary }} />
      </View>
    </View>
  );
}

function StreakCard({ icon, label, value, color, t }: { icon: string; label: string; value: number; color: string; t: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: color + "15", borderRadius: t.radius.lg, padding: t.spacing.md }}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={{ fontSize: t.font.xxl, fontWeight: t.font.weight.bold, color, marginTop: 4 }}>{value}</Text>
      <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{label}</Text>
    </View>
  );
}

function GoalProgress({ label, current, goal, unit, color, t }: { label: string; current: number; goal: number; unit: string; color: string; t: any }) {
  const pct = goal > 0 ? Math.min(Math.round(current / goal * 100), 100) : 0;
  return (
    <View style={{ marginBottom: t.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.text }}>{label}</Text>
        <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{current}{unit} / {goal}{unit}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: t.surfaceVariant, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${pct}%`, borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function RewardsScreen() {
  const { theme: t } = useAppTheme();
  const { data, loading, refresh } = useRewards();
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  if (!data && loading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background }}>
        <Header title="Rewards" />
        <ScrollView contentContainerStyle={{ padding: t.spacing.md }}>
          <SkeletonStatRow t={t} />
          <SkeletonList count={3} t={t} />
        </ScrollView>
      </View>
    );
  }

  if (!data) return null;

  const unlockedAchievements = data.achievements.filter((a) => a.unlocked);
  const lockedAchievements = data.achievements.filter((a) => !a.unlocked);
  const unlockedBadges = data.badges.filter((b) => b.unlocked);
  const displayedAchievements = showAllAchievements ? data.achievements : data.achievements.slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Rewards" />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Badge */}
        <DashboardCard delay={0}>
          <LevelBadge level={data.level} xp={data.xp} xpToNext={data.xp_to_next_level} t={t} />
        </DashboardCard>

        {/* Streaks */}
        <DashboardCard delay={80}>
          <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Streaks</Text>
          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            <StreakCard icon="flame" label="Daily" value={data.daily_streak} color="#FF5722" t={t} />
            <StreakCard icon="school" label="Attendance" value={data.attendance_streak} color="#4CAF50" t={t} />
            <StreakCard icon="checkbox" label="Tasks" value={data.task_streak} color="#2196F3" t={t} />
          </View>
        </DashboardCard>

        {/* Weekly Goals */}
        <DashboardCard delay={160}>
          <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Weekly Goals</Text>
          <GoalProgress label="Tasks" current={data.weekly_progress.tasks_completed} goal={data.weekly_goals.tasks} unit="" color={t.primary} t={t} />
          <GoalProgress label="Attendance" current={data.weekly_progress.attendance_pct} goal={data.weekly_goals.attendance_pct} unit="%" color={t.success} t={t} />
          <GoalProgress label="Study Hours" current={data.weekly_progress.study_hours} goal={data.weekly_goals.study_hours} unit="h" color={t.info} t={t} />
        </DashboardCard>

        {/* Monthly Goals */}
        <DashboardCard delay={240}>
          <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Monthly Goals</Text>
          <GoalProgress label="Tasks" current={data.monthly_progress.tasks_completed} goal={data.monthly_goals.tasks} unit="" color={t.primary} t={t} />
          <GoalProgress label="Attendance" current={data.monthly_progress.attendance_pct} goal={data.monthly_goals.attendance_pct} unit="%" color={t.success} t={t} />
          <GoalProgress label="Study Hours" current={data.monthly_progress.study_hours} goal={data.monthly_goals.study_hours} unit="h" color={t.info} t={t} />
        </DashboardCard>

        {/* Badges */}
        {unlockedBadges.length > 0 && (
          <DashboardCard delay={320}>
            <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Badges ({unlockedBadges.length})</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.sm }}>
              {unlockedBadges.map((b) => (
                <View key={b.id} style={{ alignItems: "center", width: 70 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: b.color + "25", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: b.color }}>
                    <Ionicons name={b.icon as any} size={24} color={b.color} />
                  </View>
                  <Text style={{ fontSize: 9, color: t.textSecondary, marginTop: 4, textAlign: "center" }} numberOfLines={2}>{b.name}</Text>
                </View>
              ))}
            </View>
          </DashboardCard>
        )}

        {/* Achievements */}
        <DashboardCard delay={400}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.sm }}>
            <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>
              Achievements ({unlockedAchievements.length}/{data.achievements.length})
            </Text>
            {data.achievements.length > 6 && (
              <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
                <Text style={{ fontSize: t.font.sm, color: t.primary }}>{showAllAchievements ? "Show less" : "Show all"}</Text>
              </TouchableOpacity>
            )}
          </View>
          {displayedAchievements.map((a) => (
            <View key={a.id} style={{
              flexDirection: "row", alignItems: "center", gap: t.spacing.sm,
              paddingVertical: t.spacing.sm, borderBottomWidth: 1, borderBottomColor: t.divider,
              opacity: a.unlocked ? 1 : 0.5,
            }}>
              <View style={{
                width: 40, height: 40, borderRadius: t.radius.md,
                backgroundColor: a.unlocked ? t.successContainer : t.surfaceVariant,
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name={a.icon as any} size={20} color={a.unlocked ? t.success : t.textTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: a.unlocked ? t.text : t.textSecondary }}>{a.name}</Text>
                <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{a.desc}</Text>
              </View>
              {a.unlocked ? (
                <Ionicons name="checkmark-circle" size={20} color={t.success} />
              ) : (
                <Ionicons name="lock-closed" size={16} color={t.textTertiary} />
              )}
            </View>
          ))}
        </DashboardCard>
      </ScrollView>
    </View>
  );
}
