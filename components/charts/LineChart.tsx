import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

type Props = {
  labels: string[];
  values: number[];
  color: string;
  theme: any;
  height?: number;
};

export default function LineChart({ labels, values, color, theme: t, height = 120 }: Props) {
  const max = Math.max(...values, 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, [values]);

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height }}>
        {values.map((val, idx) => {
          const barH = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, (val / max) * 100],
          });
          return (
            <View key={idx} style={{ flex: 1, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              {val > 0 ? <Text style={{ fontSize: 10, fontWeight: "600", color: t.textSecondary }}>{val}</Text> : null}
              <Animated.View style={{ width: "70%", height: barH, borderRadius: t.radius.xs, backgroundColor: color, minHeight: val > 0 ? 4 : 0 }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 4, marginTop: 6 }}>
        {labels.map((label, idx) => (
          <View key={idx} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: t.textTertiary }}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
