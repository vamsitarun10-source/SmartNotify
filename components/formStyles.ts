import { StyleSheet } from "react-native";

export const formInput = (t: any) => ({
  backgroundColor: t.inputBg,
  borderWidth: 1,
  borderColor: t.inputBorder,
  borderRadius: t.radius.md,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: t.font.md,
  color: t.text,
});

export const formChip = (t: any) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 4,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: t.radius.full,
  borderWidth: 1,
  borderColor: t.border,
  backgroundColor: t.surfaceVariant,
});

export const formChipActive = (t: any) => ({
  backgroundColor: t.primary,
  borderColor: t.primary,
});

export const formChipText = (t: any) => ({
  fontSize: t.font.sm,
  fontWeight: "600" as const,
  color: t.textSecondary,
});

export const formChipTextActive = {
  color: "#fff",
};

export const formBtn = (t: any) => ({
  backgroundColor: t.primary,
  borderRadius: t.radius.lg,
  paddingVertical: 14,
  alignItems: "center" as const,
  marginTop: 8,
});

export const formBtnText = (t: any) => ({
  color: "#fff",
  fontSize: t.font.md,
  fontWeight: "700" as const,
});

export const formCard = (t: any) => ({
  backgroundColor: t.card,
  borderRadius: t.radius.lg,
  borderWidth: 1,
  borderColor: t.cardBorder,
  padding: t.spacing.md,
  marginBottom: t.spacing.sm,
  ...t.shadow.sm,
});

export const formTitle = (t: any) => ({
  fontSize: t.font.lg,
  fontWeight: t.font.weight.bold as any,
  color: t.text,
  marginBottom: t.spacing.sm,
});
