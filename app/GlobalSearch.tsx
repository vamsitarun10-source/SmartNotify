import React, { useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import type { SearchResultItem } from "../services/search";

const TYPE_NAV: Record<string, { screen: string; param?: string }> = {
  event: { screen: "AddEvent" },
  task: { screen: "AddTask" },
  assignment: { screen: "AddAssignment" },
  exam: { screen: "AddExam" },
  note: { screen: "Notes" },
  timetable: { screen: "Timetable" },
};

export default function GlobalSearchScreen() {
  const navigation = useNavigation<any>();
  const { theme: t } = useAppTheme();
  const { results, loading, query, totalResults, search, clear } = useGlobalSearch();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const onItemPress = (item: SearchResultItem) => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      {/* Search Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingHorizontal: t.spacing.md, paddingTop: t.spacing.md, paddingBottom: t.spacing.sm, backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.divider }}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: t.radius.md, borderWidth: 1, borderColor: t.inputBorder, paddingHorizontal: t.spacing.sm }}>
          <Ionicons name="search" size={18} color={t.textTertiary} />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: t.spacing.sm, fontSize: t.font.md, color: t.text }}
            placeholder="Search everything..."
            placeholderTextColor={t.textTertiary}
            value={query}
            onChangeText={search}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={t.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <ActivityIndicator color={t.primary} />
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: t.spacing.sm }}>Searching...</Text>
          </View>
        ) : query && totalResults === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="search-outline" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>No results for "{query}"</Text>
          </View>
        ) : !query ? (
          <View style={{ alignItems: "center", paddingVertical: t.spacing.xl }}>
            <Ionicons name="search" size={48} color={t.textTertiary} />
            <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm }}>Search across all your data</Text>
            <Text style={{ fontSize: t.font.sm, color: t.textTertiary, marginTop: 4 }}>Classes, tasks, assignments, exams, notes, timetable</Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: t.font.sm, color: t.textSecondary, marginBottom: t.spacing.md }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""} in {results.length} categor{results.length !== 1 ? "ies" : "y"}
            </Text>

            {results.map((cat) => (
              <View key={cat.category} style={{ marginBottom: t.spacing.lg }}>
                <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>{cat.category}</Text>
                {cat.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, padding: t.spacing.md, marginBottom: t.spacing.xs, borderLeftWidth: 4, borderLeftColor: item.color, ...t.shadow.sm }}
                    onPress={() => onItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: t.radius.md, backgroundColor: item.color + "20", alignItems: "center", justifyContent: "center", marginRight: t.spacing.sm }}>
                      <Ionicons name={getIcon(item.type) as any} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: t.font.md, fontWeight: t.font.weight.semibold, color: t.text }} numberOfLines={1}>{item.title}</Text>
                      <Text style={{ fontSize: t.font.xs, color: t.textSecondary, marginTop: 2 }} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    event: "school", task: "checkbox", assignment: "document-text",
    exam: "school", note: "document-text", timetable: "repeat",
  };
  return icons[type] || "layers";
}
