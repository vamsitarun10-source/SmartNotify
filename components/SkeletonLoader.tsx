import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useAppTheme } from "../constants/ThemeContext";

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
};

export function Skeleton({ width = "100%", height = 16, borderRadius, style }: Props) {
  const { theme: t } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width, height,
          borderRadius: borderRadius ?? t.radius.sm,
          backgroundColor: t.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ lines = 3, t }: { lines?: number; t: any }) {
  return (
    <View style={{ backgroundColor: t.card, borderRadius: t.radius.lg, padding: t.spacing.md, marginBottom: t.spacing.sm, borderWidth: 1, borderColor: t.cardBorder }}>
      <Skeleton width="60%" height={16} borderRadius={t.radius.sm} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "40%" : "90%"} height={12} borderRadius={t.radius.xs} style={{ marginTop: 10 }} />
      ))}
    </View>
  );
}

export function SkeletonList({ count = 4, t }: { count?: number; t: any }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, padding: t.spacing.md, marginBottom: t.spacing.sm, borderWidth: 1, borderColor: t.cardBorder }}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={{ flex: 1, marginLeft: t.spacing.sm }}>
            <Skeleton width="70%" height={14} borderRadius={t.radius.xs} />
            <Skeleton width="45%" height={10} borderRadius={t.radius.xs} style={{ marginTop: 8 }} />
          </View>
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonStatRow({ count = 3, t }: { count?: number; t: any }) {
  return (
    <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", backgroundColor: t.card, borderRadius: t.radius.lg, padding: t.spacing.md, borderWidth: 1, borderColor: t.cardBorder }}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={30} height={20} borderRadius={t.radius.xs} style={{ marginTop: 8 }} />
          <Skeleton width={50} height={10} borderRadius={t.radius.xs} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonCalendar({ t }: { t: any }) {
  return (
    <View style={{ backgroundColor: t.card, borderRadius: t.radius.lg, padding: t.spacing.md, borderWidth: 1, borderColor: t.cardBorder, marginBottom: t.spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <Skeleton width={120} height={20} borderRadius={t.radius.sm} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={32} height={32} borderRadius={16} />
        ))}
      </View>
      {[0, 1, 2, 3, 4].map((row) => (
        <View key={row} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width={32} height={32} borderRadius={16} />
          ))}
        </View>
      ))}
    </View>
  );
}
