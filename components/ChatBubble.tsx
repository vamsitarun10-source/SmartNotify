import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "../constants/ThemeContext";

type Props = {
  message: string;
  role: "user" | "bot";
};

export default function ChatBubble({ message, role }: Props) {
  const { theme: t } = useAppTheme();
  const isUser = role === "user";

  return (
    <View style={[row(t), isUser ? rowUser(t) : rowBot(t)]}>
      <View style={[bubble(t), isUser ? bubbleUser(t) : bubbleBot(t)]}>
        {!isUser && <Text style={avatar(t)}>AI</Text>}
        <Text style={isUser ? textUser(t) : textBot(t)}>{message}</Text>
      </View>
    </View>
  );
}

const row = (t: any) => StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 4 },
}).row;

const rowUser = (t: any) => ({ justifyContent: "flex-end" as const, paddingHorizontal: t.spacing.md });
const rowBot = (t: any) => ({ justifyContent: "flex-start" as const, paddingHorizontal: t.spacing.md });

const bubble = (t: any) => StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    paddingVertical: t.spacing.sm + 2,
    paddingHorizontal: t.spacing.md,
    borderRadius: t.radius.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: t.spacing.sm,
  },
}).bubble;

const bubbleUser = (t: any) => ({
  backgroundColor: t.primary,
  borderBottomRightRadius: t.radius.xs,
});

const bubbleBot = (t: any) => ({
  backgroundColor: t.surface,
  borderWidth: 1,
  borderColor: t.border,
  borderBottomLeftRadius: t.radius.xs,
});

const avatar = (t: any) => ({
  fontSize: t.font.xs,
  fontWeight: t.font.weight.bold,
  color: t.primary,
  backgroundColor: t.primaryContainer,
  width: 24,
  height: 24,
  textAlign: "center",
  lineHeight: 24,
  borderRadius: t.radius.full,
  overflow: "hidden",
});

const textUser = (t: any) => ({
  color: t.onPrimary,
  fontSize: t.font.md,
  lineHeight: 22,
  flex: 1,
});

const textBot = (t: any) => ({
  color: t.text,
  fontSize: t.font.md,
  lineHeight: 22,
  flex: 1,
});
