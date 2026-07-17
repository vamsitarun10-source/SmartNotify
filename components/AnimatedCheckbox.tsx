import React, { useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  checked: boolean;
  onPress: () => void;
  size?: number;
  checkedColor?: string;
  uncheckedColor?: string;
  accessibilityLabel?: string;
};

export default function AnimatedCheckbox({ checked, onPress, size = 24, checkedColor = "#66BB6A", uncheckedColor = "#E2E8F0", accessibilityLabel }: Props) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0.8)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.6, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: checked ? checkedColor : uncheckedColor,
          backgroundColor: checked ? checkedColor : "transparent",
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }}
      >
        {checked && <Ionicons name="checkmark" size={size * 0.6} color="#fff" />}
      </Animated.View>
    </TouchableOpacity>
  );
}
