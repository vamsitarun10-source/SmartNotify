import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  onPress: () => void;
  icon?: string;
  color?: string;
  size?: number;
  backgroundColor?: string;
  style?: any;
  entranceDelay?: number;
};

export default function AnimatedFAB({ onPress, icon = "add", color = "#fff", size = 28, backgroundColor = "#5C6BC0", style, entranceDelay = 0 }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const entranceY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(entranceDelay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
        Animated.spring(entranceY, { toValue: 0, friction: 5, tension: 100, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.85, friction: 3, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          {
            width: 56, height: 56, borderRadius: 28,
            backgroundColor, alignItems: "center", justifyContent: "center",
            elevation: 6,
            shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25, shadowRadius: 6,
            transform: [{ scale }, { translateY: entranceY }],
          },
          style,
        ]}
      >
        <Ionicons name={icon as any} size={size} color={color} />
      </Animated.View>
    </TouchableOpacity>
  );
}
