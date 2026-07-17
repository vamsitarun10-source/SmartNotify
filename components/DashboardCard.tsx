import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "../constants/ThemeContext";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
};

export default function DashboardCard({ children, style, delay = 0 }: Props) {
  const { theme: t } = useAppTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles(t).card,
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = (t: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.cardBorder,
      padding: t.spacing.md,
      marginBottom: t.spacing.md,
      ...t.shadow.sm,
    },
  });
