import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useEvents } from "../hooks/useEvents";
import { useAssignments } from "../hooks/useAssignments";
import { useExams } from "../hooks/useExams";
import { useCalendarEvents } from "../hooks/useCalendar";
import { deleteCalendarEvent } from "../services/calendar";
import MonthCalendar from "../components/MonthCalendar";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";

type DayItem = {
  title: string;
  category: string;
  color: string;
  time?: string;
  notes?: string;
  id?: string;
  isOwn?: boolean;
};

const CATEGORIES = [
  { key: "class", label: "Classes", color: "#5C6BC0" },
  { key: "assignment", label: "Assignments", color: "#FFA726" },
  { key: "exam", label: "Exams", color: "#EF5350" },
  { key: "holiday", label: "Holidays", color: "#26A69A" },
  { key: "personal", label: "Personal", color: "#42A5F5" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const { events: classEvents, refresh: refreshEvents, remove: removeClassEvent } = useEvents();
  const { assignments, refresh: refreshAssignments } = useAssignments();
  const { exams, refresh: refreshExams } = useExams();
  const { events: calEvents, refresh: refreshCal, remove: removeCal } = useCalendarEvents();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshEvents(), refreshAssignments(), refreshExams(), refreshCal()]);
    setRefreshing(false);
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, DayItem[]> = {};

    classEvents.forEach((e) => {
      if (!e.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push({ title: e.title, category: "class", color: CATEGORIES[0].color, time: e.time, id: e.id });
    });

    assignments.forEach((a) => {
      if (!a.due_date) return;
      if (!map[a.due_date]) map[a.due_date] = [];
      map[a.due_date].push({ title: a.title, category: "assignment", color: CATEGORIES[1].color, notes: a.subject });
    });

    exams.forEach((e) => {
      if (!e.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push({ title: e.title, category: "exam", color: CATEGORIES[2].color, time: e.time, notes: e.exam_type });
    });

    calEvents.forEach((ce) => {
      if (!ce.date) return;
      if (!map[ce.date]) map[ce.date] = [];
      const catInfo = CATEGORIES.find((c) => c.key === ce.category);
      map[ce.date].push({ title: ce.title, category: ce.category, color: catInfo?.color || CATEGORIES[4].color, id: ce.id, isOwn: true });
    });

    return map;
  }, [classEvents, assignments, exams, calEvents]);

  const selectedItems = useMemo(() => eventsByDate[selectedDate] || [], [eventsByDate, selectedDate]);

  const handleDeleteClass = (item: DayItem) => {
    Alert.alert("Delete Class", `Are you sure you want to delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        if (!item.id) return;
        try {
          await removeClassEvent(item.id);
        } catch { Alert.alert("Error", "Could not delete the class. Please try again."); }
      }},
    ]);
  };

  const handleDeleteOwn = (item: DayItem) => {
    Alert.alert("Delete", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { if (item.id) removeCal(item.id); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Calendar" showAdd onAdd={() => navigation.navigate("AddCalendarEvent")} />
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 60 + insets.bottom + 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <MonthCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          eventsByDate={eventsByDate}
          theme={t}
        />

        {/* Legend */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {CATEGORIES.map((cat) => (
            <View key={cat.key} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: t.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cat.color }} />
              <Text style={{ fontSize: 11, fontWeight: "500", color: t.textSecondary }}>{cat.label}</Text>
            </View>
          ))}
        </View>

        {/* Selected day items */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginBottom: t.spacing.sm }}>
          <Ionicons name="calendar" size={18} color={t.primary} />
          <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>{selectedDate}</Text>
          {selectedItems.length > 0 ? (
            <View style={{ backgroundColor: t.primaryContainer, borderRadius: t.radius.full, paddingHorizontal: t.spacing.sm, paddingVertical: 1 }}>
              <Text style={{ fontSize: t.font.xs, fontWeight: "700", color: t.primary }}>{selectedItems.length}</Text>
            </View>
          ) : null}
        </View>

        {selectedItems.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl, backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder }}>
            <Ionicons name="calendar-outline" size={36} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: t.spacing.sm }}>No events on this day</Text>
          </View>
        ) : (
          selectedItems.map((item, idx) => (
            <View
              key={`${item.category}-${item.title}-${idx}`}
              style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.sm, borderLeftWidth: 4, borderLeftColor: item.color, ...t.shadow.sm }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
                  <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>{item.title}</Text>
                  <View style={{ backgroundColor: item.color + "20", paddingHorizontal: 6, paddingVertical: 1, borderRadius: t.radius.full }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: item.color }}>{item.category}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, marginTop: 4 }}>
                  {item.time ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color={t.textTertiary} />
                      <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{item.time}</Text>
                    </View>
                  ) : null}
                  {item.notes ? (
                    <Text style={{ fontSize: t.font.xs, color: t.textTertiary }}>{item.notes}</Text>
                  ) : null}
                </View>
              </View>
              {item.isOwn ? (
                <TouchableOpacity onPress={() => handleDeleteOwn(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                </TouchableOpacity>
              ) : item.category === "class" && item.id ? (
                <TouchableOpacity onPress={() => handleDeleteClass(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <AnimatedFAB
        onPress={() => navigation.navigate("AddCalendarEvent")}
        backgroundColor={t.primary}
        entranceDelay={400}
        style={{ position: 'absolute', right: 16, bottom: 60 + insets.bottom + 16, zIndex: 100 }}
        accessibilityLabel="Add event to calendar"
        accessibilityHint="Opens the add calendar event form"
        accessibilityRole="button"
      />
    </View>
  );
}
