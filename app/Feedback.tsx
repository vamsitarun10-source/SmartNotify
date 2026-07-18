import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../constants/ThemeContext";
import { SUPPORT_EMAIL } from "../constants/appInfo";
import Header from "../components/Header";

const CATEGORIES = ["Bug Report", "Feature Request", "General Feedback", "Other"];

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { theme: t } = useAppTheme();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    if (!category) { Alert.alert("Select category", "Please choose a feedback category."); return; }
    if (!message.trim()) { Alert.alert("Missing message", "Please describe your feedback."); return; }

    try {
      const feedback = {
        category,
        message: message.trim(),
        email: email.trim() || "anonymous",
        timestamp: new Date().toISOString(),
        appVersion: "1.0.0",
      };
      const existing = await AsyncStorage.getItem("feedback_history");
      const history = existing ? JSON.parse(existing) : [];
      history.push(feedback);
      await AsyncStorage.setItem("feedback_history", JSON.stringify(history));
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Could not save feedback. Please try again.");
    }
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background }}>
        <Header title="Feedback" showBack />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: t.spacing.xl }}>
          <Ionicons name="checkmark-circle" size={64} color={t.success} />
          <Text style={{ fontSize: t.font.xl, fontWeight: t.font.weight.bold, color: t.text, marginTop: t.spacing.md }}>Thank you!</Text>
          <Text style={{ fontSize: t.font.md, color: t.textSecondary, marginTop: t.spacing.sm, textAlign: "center" }}>Your feedback has been recorded. We appreciate your input!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Header title="Feedback" showBack />
      <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.md }}>Send Feedback</Text>

        {/* Category */}
        <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.textSecondary, marginBottom: t.spacing.xs }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.xs, marginBottom: t.spacing.md }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[chip(t), category === cat && chipActive(t)]}
              onPress={() => setCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[chipText(t), category === cat && chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.textSecondary, marginBottom: t.spacing.xs }}>Message</Text>
        <TextInput
          style={[input(t), { height: 120, textAlignVertical: "top", marginBottom: t.spacing.md }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your feedback, report a bug, or suggest a feature..."
          placeholderTextColor={t.textTertiary}
          multiline
          numberOfLines={5}
        />

        {/* Email (optional) */}
        <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.semibold, color: t.textSecondary, marginBottom: t.spacing.xs }}>Email (optional)</Text>
        <TextInput
          style={[input(t), { marginBottom: t.spacing.lg }]}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={t.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Submit */}
        <TouchableOpacity style={[btn(t), { opacity: message.trim() && category ? 1 : 0.5 }]} onPress={onSubmit} disabled={!message.trim() || !category} activeOpacity={0.8}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={btnText(t)}>Submit Feedback</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const chip = (t: any) => ({ paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.full, borderWidth: 1, borderColor: t.border, backgroundColor: t.surfaceVariant });
const chipActive = (t: any) => ({ backgroundColor: t.primaryContainer, borderColor: t.primary });
const chipText = (t: any) => ({ fontSize: t.font.sm, fontWeight: "600" as const, color: t.textSecondary });
const chipTextActive = { color: "#5C6BC0" };
const input = (t: any) => ({ backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: t.font.md, color: t.text });
const btn = (t: any) => ({ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.spacing.sm, backgroundColor: t.primary, borderRadius: t.radius.lg, paddingVertical: 14 });
const btnText = (t: any) => ({ color: "#fff", fontSize: t.font.md, fontWeight: "700" as const });
