import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";

type Props = {
  title: string;
  showBack?: boolean;
  showAdd?: boolean;
  onAdd?: () => void;
  rightComponent?: React.ReactNode;
};

export default function Header({ title, showBack, showAdd, onAdd, rightComponent }: Props) {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const s = styles(theme);

  return (
    <View style={s.header}>
      {showBack ? (
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      ) : <View style={s.placeholder} />}

      <Text style={s.title}>{title}</Text>

      {rightComponent || (
        showAdd ? (
          <TouchableOpacity style={s.iconBtn} onPress={onAdd} activeOpacity={0.6}>
            <Ionicons name="add" size={26} color={theme.primary} />
          </TouchableOpacity>
        ) : <View style={s.placeholder} />
      )}
    </View>
  );
}

const styles = (t: any) => StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: t.spacing.md,
    paddingVertical: 14,
    backgroundColor: t.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.divider,
    elevation: 0,
  },
  title: {
    fontSize: t.font.xl,
    fontWeight: t.font.weight.bold,
    color: t.text,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: t.radius.full,
  },
  placeholder: { width: 40 },
});
