import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { highlightMatch } from "../services/searchService";
import { EMPTY_ACTIONS } from "../constants/search";
import type { SearchItem } from "../constants/search";

const TAB_SCREENS = new Set([
  "Home", "Calendar", "Tasks", "Assignments", "Exams",
  "Timetable", "Profile", "Attendance", "Statistics", "Rewards"
]);

function navigateTo(navigation: any, screen: string, params?: any) {
  if (screen === "Home" && params?.focusAI) {
    navigation.navigate("Main", { screen: "Home", params });
  } else if (TAB_SCREENS.has(screen)) {
    navigation.navigate("Main", { screen, params });
  } else {
    navigation.navigate(screen, params || {});
  }
}

export default function GlobalSearchScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const { results, loading, query, totalResults, recent, search, clear, saveRecent, clearHistory, refreshData } = useGlobalSearch();
  const inputRef = useRef<TextInput>(null);
  const [showRecent, setShowRecent] = useState(true);

  useEffect(() => {
    refreshData();
    const initialQuery = route.params?.initialQuery;
    if (initialQuery) {
      inputRef.current?.setNativeProps?.({ text: initialQuery });
      setShowRecent(false);
      search(initialQuery);
      navigation.setParams({ initialQuery: undefined });
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const onItemPress = async (item: SearchItem) => {
    Keyboard.dismiss();
    if (query.trim()) {
      await saveRecent(query.trim());
    }
    navigateTo(navigation, item.screen, item.params);
  };

  const onClear = () => {
    clear();
    inputRef.current?.focus();
    setShowRecent(true);
  };

  const onRecentPress = (q: string) => {
    inputRef.current?.setNativeProps?.({ text: q });
    setShowRecent(false);
    search(q);
  };

  const onChangeText = (text: string) => {
    setShowRecent(false);
    search(text);
  };

  const onFocus = () => {
    if (!query) {
      setShowRecent(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Search Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingHorizontal: t.spacing.sm, paddingTop: insets.top + t.spacing.sm, paddingBottom: t.spacing.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.divider }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.inputBorder, paddingHorizontal: t.spacing.sm }}>
          <Ionicons name="search" size={18} color={t.textTertiary} />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: t.spacing.sm, fontSize: t.font.md, color: t.text }}
            placeholder="Search classes, tasks, notes..."
            placeholderTextColor={t.textTertiary}
            value={query}
            onChangeText={onChangeText}
            onFocus={onFocus}
            returnKeyType="search"
            accessibilityLabel="Search input"
          />
          {query ? (
            <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={t.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <ActivityIndicator color={t.primary} />
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: t.spacing.sm }}>Searching...</Text>
          </View>
        ) : showRecent && !query ? (
          recent.length > 0 ? (
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.md }}>
                <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.bold, color: t.text }}>Recent Searches</Text>
                <TouchableOpacity onPress={clearHistory} activeOpacity={0.6}>
                  <Text style={{ fontSize: t.font.sm, color: t.primary }}>Clear History</Text>
                </TouchableOpacity>
              </View>
              {recent.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: t.spacing.sm, gap: t.spacing.sm }}
                  onPress={() => onRecentPress(r)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="time-outline" size={18} color={t.textTertiary} />
                  <Text style={{ fontSize: t.font.md, color: t.text, flex: 1 }}>{r}</Text>
                  <Ionicons name="arrow-up" size={16} color={t.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 80 }}>
              <Ionicons name="search" size={56} color={t.textTertiary} />
              <Text style={{ fontSize: t.font.lg, color: t.textSecondary, marginTop: t.spacing.md }}>Search across all your data</Text>
              <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: 4, textAlign: "center", paddingHorizontal: t.spacing.xl }}>
                Classes, tasks, assignments, exams, notes, timetable
              </Text>
            </View>
          )
        ) : query && totalResults === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="search-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No matching results found</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: t.spacing.sm, marginTop: t.spacing.lg }}>
              {EMPTY_ACTIONS.map((action, idx) => {
                const params = action.label === "Ask AI"
                  ? { focusAI: true, searchQuery: query }
                  : action.params;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm, gap: t.spacing.sm, ...t.shadow.sm }}
                    onPress={() => {
                      Keyboard.dismiss();
                      navigateTo(navigation, action.screen, params);
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel={action.label}
                    accessibilityRole="button"
                  >
                    <Ionicons name={action.icon as any} size={20} color={t.primary} />
                    <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }}>{action.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : query ? (
          <>
            <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginBottom: t.spacing.md }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </Text>
            {results.map((cat) => (
              <View key={cat.category} style={{ marginBottom: t.spacing.lg }}>
                <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>{cat.category}</Text>
                {cat.items.map((item) => {
                  const hl = highlightMatch(item.title, query);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.xs, borderLeftWidth: 4, borderLeftColor: item.color, ...t.shadow.sm }}
                      onPress={() => onItemPress(item)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Open ${item.title}`}
                      accessibilityRole="button"
                    >
                      <View style={{ width: 36, height: 36, borderRadius: t.radius.md, backgroundColor: item.color + "20", alignItems: "center", justifyContent: "center", marginRight: t.spacing.sm }}>
                        <Ionicons name={getIcon(item.type) as any} size={18} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>
                          {hl.before}
                          <Text style={{ backgroundColor: t.warning + "40", color: t.text, fontWeight: t.font.weight.bold }}>{hl.match}</Text>
                          {hl.after}
                        </Text>
                        <Text style={{ fontSize: t.font.xs, color: t.textSecondary, marginTop: 2 }} numberOfLines={1}>{item.subtitle}</Text>
                      </View>
                      {item.type === "screen" ? null : <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    event: "school", task: "checkbox", assignment: "document-text",
    exam: "calendar", note: "document-text", timetable: "repeat",
    calendar: "calendar-outline", screen: "arrow-forward",
  };
  return icons[type] || "layers";
}
