import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../constants/ThemeContext";

const { width } = Dimensions.get("window");

const ONBOARDING_KEY = "onboarding_complete";

type Slide = { icon: string; title: string; subtitle: string; color: string };

const SLIDES: Slide[] = [
  { icon: "sparkles", title: "AI-Powered Scheduling", subtitle: "Just type what you need in natural language and our AI handles the rest. No more manual entry.", color: "#5C6BC0" },
  { icon: "notifications", title: "Smart Reminders", subtitle: "Get notified before every class, assignment, and exam. Snooze, dismiss, or mark attendance — all from the notification.", color: "#FFA726" },
  { icon: "analytics", title: "Track Everything", subtitle: "Attendance, tasks, exams, notes — all in one place with beautiful charts and insights.", color: "#26A69A" },
];

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
}

export async function completeOnboarding() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { theme: t } = useAppTheme();
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index);
  }).current;

  const onDone = async () => {
    await completeOnboarding();
    onComplete();
  };

  const onSkip = async () => {
    await completeOnboarding();
    onComplete();
  };

  const onNext = () => {
    if (current < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: current + 1 });
    } else {
      onDone();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <View style={styles(t).container}>
        {/* Skip */}
        <TouchableOpacity style={styles(t).skipBtn} onPress={onSkip} activeOpacity={0.6}>
          <Text style={{ fontSize: t.font.md, color: t.textSecondary }}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          renderItem={({ item }) => (
            <View style={styles(t).slide}>
              <View style={[styles(t).iconCircle, { backgroundColor: item.color + "18" }]}>
                <Ionicons name={item.icon as any} size={64} color={item.color} />
              </View>
              <Text style={[styles(t).title, { color: t.text }]}>{item.title}</Text>
              <Text style={[styles(t).subtitle, { color: t.textSecondary }]}>{item.subtitle}</Text>
            </View>
          )}
        />

        {/* Dots */}
        <View style={styles(t).dots}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{
                  height: 8,
                  width: dotWidth,
                  borderRadius: 4,
                  backgroundColor: t.primary,
                  opacity: dotOpacity,
                  marginHorizontal: 4,
                }}
              />
            );
          })}
        </View>

        {/* Next/Done Button */}
        <TouchableOpacity
          style={[styles(t).nextBtn, { backgroundColor: t.primary }]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: t.font.lg, fontWeight: "700", color: "#fff" }}>
            {current === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name={current === SLIDES.length - 1 ? "checkmark" : "arrow-forward"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (t: any) => StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { alignSelf: "flex-end", paddingHorizontal: t.spacing.lg, paddingVertical: t.spacing.md },
  slide: { width, alignItems: "center", justifyContent: "center", paddingHorizontal: t.spacing.xl },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    alignItems: "center", justifyContent: "center",
    marginBottom: t.spacing.xl,
  },
  title: { fontSize: t.font.xxl, fontWeight: "700", textAlign: "center", marginBottom: t.spacing.sm },
  subtitle: { fontSize: t.font.md, textAlign: "center", lineHeight: 24, paddingHorizontal: t.spacing.lg },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: t.spacing.lg },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: t.spacing.xl, marginBottom: t.spacing.xl,
    paddingVertical: 16, borderRadius: t.radius.lg, gap: t.spacing.sm,
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
});
