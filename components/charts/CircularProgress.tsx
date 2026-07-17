import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  theme: any;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({ value, maxValue = 100, size = 100, strokeWidth = 8, color, label, theme: t }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / maxValue, 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: pct, duration: 800, useNativeDriver: false }).start();
  }, [pct]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={t.surfaceVariant} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.text }}>{Math.round(pct * 100)}%</Text>
        {label ? <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{label}</Text> : null}
      </View>
    </View>
  );
}
