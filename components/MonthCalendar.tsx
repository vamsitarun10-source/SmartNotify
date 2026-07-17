import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type DayItem = { category: string; color: string };

type Props = {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  eventsByDate: Record<string, DayItem[]>;
  theme: any;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function MonthCalendar({ selectedDate, onDateSelect, eventsByDate, theme: t }: Props) {
  const now = new Date();
  const year = parseInt(selectedDate.slice(0, 4));
  const month = parseInt(selectedDate.slice(5, 7)) - 1;
  const todayStr = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  const monthName = new Date(year, month).toLocaleString("en-US", { month: "long" });
  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    return formatDate(d.getFullYear(), d.getMonth(), 15);
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    return formatDate(d.getFullYear(), d.getMonth(), 15);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, ...t.shadow.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onDateSelect(prevMonth())} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color={t.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: t.text, fontSize: t.font.xl, fontWeight: t.font.weight.bold }]}>{monthName} {year}</Text>
        <TouchableOpacity onPress={() => onDateSelect(nextMonth())} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={22} color={t.primary} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaderRow}>
        {DAYS.map((d, i) => (
          <View key={i} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, { color: i === 0 || i === 6 ? t.danger : t.textTertiary }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) return <View key={`e${idx}`} style={styles.cell} />;
          const dateStr = formatDate(year, month, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const items = eventsByDate[dateStr] || [];
          const uniqueColors = [...new Set(items.map((it) => it.color))].slice(0, 4);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.cell, isSelected && { backgroundColor: t.primary + "20", borderRadius: t.radius.sm }]}
              onPress={() => onDateSelect(dateStr)}
              activeOpacity={0.6}
            >
              {isToday ? (
                <View style={[styles.todayCircle, { backgroundColor: t.primary }]}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{day}</Text>
                </View>
              ) : (
                <Text style={{ fontSize: 13, fontWeight: isSelected ? "700" : "400", color: isSelected ? t.primary : t.text }}>{day}</Text>
              )}
              {uniqueColors.length > 0 ? (
                <View style={styles.dotRow}>
                  {uniqueColors.map((c, ci) => (
                    <View key={ci} style={[styles.dot, { backgroundColor: c }]} />
                  ))}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  monthTitle: { letterSpacing: -0.3 },
  dayHeaderRow: { flexDirection: "row", marginBottom: 4 },
  dayHeaderCell: { flex: 1, alignItems: "center", paddingVertical: 4 },
  dayHeaderText: { fontSize: 12, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", aspectRatio: 1.2, alignItems: "center", justifyContent: "center", gap: 2 },
  todayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dotRow: { flexDirection: "row", gap: 3, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
