import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

type BarItem = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: BarItem[];
  maxValue?: number;
  theme: any;
  horizontal?: boolean;
  barHeight?: number;
};

export default function BarChart({ data, maxValue, theme: t, horizontal = true, barHeight = 20 }: Props) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, [data]);

  if (horizontal) {
    return (
      <View>
        {data.map((item, idx) => {
          const width = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", `${(item.value / max) * 100}%`],
          });
          return (
            <View key={idx} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{item.label}</Text>
                <Text style={{ fontSize: t.font.xs, fontWeight: "600", color: t.text }}>{item.value}</Text>
              </View>
              <View style={{ height: barHeight, borderRadius: t.radius.sm, backgroundColor: t.surfaceVariant, overflow: "hidden" }}>
                <Animated.View style={{ height: "100%", width, borderRadius: t.radius.sm, backgroundColor: item.color }} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 120 }}>
      {data.map((item, idx) => {
        const height = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (item.value / max) * 100],
        });
        return (
          <View key={idx} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: t.textSecondary }}>{item.value}</Text>
            <Animated.View style={{ width: "100%", height, borderRadius: t.radius.xs, backgroundColor: item.color }} />
            <Text style={{ fontSize: 9, color: t.textTertiary }}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
