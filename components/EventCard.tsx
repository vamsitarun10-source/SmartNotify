import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import type { ClassEvent } from "../services/events";

type Props = {
  event: ClassEvent;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  actionLabel?: string;
};

export default function EventCard({ event, onEdit, onDelete, showActions = false }: Props) {
  const { theme: t } = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, s(t).wrapper]}>
      <TouchableOpacity
        style={s(t).card}
        activeOpacity={0.8}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={s(t).colorBar} />
        <View style={s(t).content}>
          <View style={s(t).header}>
            <Text style={s(t).title} numberOfLines={1}>{event.title}</Text>
            {event.subject ? <Text style={s(t).subject}>{event.subject}</Text> : null}
          </View>
          <View style={s(t).metaRow}>
            <View style={s(t).chip}>
              <Ionicons name="calendar-outline" size={12} color={t.primary} />
              <Text style={s(t).chipText}>{event.date}</Text>
            </View>
            <View style={s(t).chip}>
              <Ionicons name="time-outline" size={12} color={t.primary} />
              <Text style={s(t).chipText}>{event.time}</Text>
            </View>
            {event.reminder_before ? (
              <View style={s(t).chip}>
                <Ionicons name="alarm-outline" size={12} color={t.primary} />
                <Text style={s(t).chipText}>{event.reminder_before}m</Text>
              </View>
            ) : null}
          </View>
          {event.location ? (
            <View style={s(t).metaRow}>
              <Ionicons name="location-outline" size={13} color={t.textSecondary} />
              <Text style={s(t).locationText}>{event.location}</Text>
            </View>
          ) : null}
          {showActions ? (
            <View style={s(t).actions}>
              {onEdit ? (
                <TouchableOpacity style={s(t).actionBtn} onPress={onEdit} activeOpacity={0.6}>
                  <Ionicons name="create-outline" size={18} color={t.primary} />
                  <Text style={s(t).actionText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
              {onDelete ? (
                <TouchableOpacity style={[s(t).actionBtn, { marginLeft: 8 }]} onPress={onDelete} activeOpacity={0.6}>
                  <Ionicons name="trash-outline" size={18} color={t.danger} />
                  <Text style={[s(t).actionText, { color: t.danger }]}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = (t: any) => StyleSheet.create({
  wrapper: { marginBottom: t.spacing.sm },
  card: {
    flexDirection: "row",
    backgroundColor: t.card,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.cardBorder,
    overflow: "hidden",
    ...t.shadow.sm,
  },
  colorBar: {
    width: 4,
    backgroundColor: t.primary,
    borderRadius: 2,
  },
  content: { flex: 1, padding: t.spacing.md },
  header: { marginBottom: t.spacing.sm },
  title: {
    fontSize: t.font.lg,
    fontWeight: t.font.weight.semibold,
    color: t.text,
  },
  subject: {
    fontSize: t.font.sm,
    fontWeight: t.font.weight.medium,
    color: t.primary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: t.spacing.xs,
    marginBottom: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.primaryContainer,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: 3,
    borderRadius: t.radius.full,
    gap: 4,
  },
  chipText: {
    fontSize: t.font.xs,
    fontWeight: t.font.weight.medium,
    color: t.primary,
  },
  locationText: {
    fontSize: t.font.sm,
    color: t.textSecondary,
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: t.spacing.sm,
    paddingTop: t.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.divider,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radius.md,
    gap: 4,
  },
  actionText: {
    fontSize: t.font.sm,
    fontWeight: t.font.weight.semibold,
    color: t.primary,
  },
});
