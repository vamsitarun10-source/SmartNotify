import React from "react";
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../../constants/ThemeContext";

type Props = { suggestions: any[] };

export default function AiSuggestionsWidget({ suggestions }: Props) {
  const { theme: t } = useAppTheme();
  return (
    <View>
      {suggestions.slice(0, 3).map((s, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm, paddingVertical: 6, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: t.divider }}>
          <View style={{ width: 32, height: 32, borderRadius: t.radius.sm, backgroundColor: s.color + "20", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={s.icon as any} size={16} color={s.color} />
          </View>
          <Text style={{ fontSize: t.font.sm, color: t.text, flex: 1 }}>{s.text}</Text>
        </View>
      ))}
    </View>
  );
}
