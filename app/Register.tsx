import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useAuth } from "../hooks/useAuth";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const { theme: t } = useAppTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e: any) {
      Alert.alert(
        "Registration failed",
        e?.response?.data?.detail || e?.message || "Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    safeArea: {
      flex: 1,
    },
    inner: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: t.spacing.xl,
      alignItems: "center",
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: t.spacing.lg,
      shadowColor: t.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    heading: {
      fontSize: t.font.xxl,
      fontWeight: t.font.weight.bold as any,
      color: t.text,
      marginBottom: t.spacing.xs,
    },
    sub: {
      fontSize: t.font.md,
      color: t.textSecondary,
      marginBottom: t.spacing.xxl,
    },
    inputWrapper: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.inputBg,
      borderWidth: 1.5,
      borderColor: t.inputBorder,
      borderRadius: t.radius.md,
      paddingHorizontal: t.spacing.md,
      height: 52,
      marginBottom: t.spacing.md,
    },
    inputIcon: {
      marginRight: t.spacing.sm,
      fontSize: 20,
      color: t.textTertiary,
    },
    input: {
      flex: 1,
      fontSize: t.font.md,
      color: t.text,
      paddingVertical: 0,
    },
    btn: {
      width: "100%",
      backgroundColor: t.primary,
      borderRadius: t.radius.md,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: t.spacing.sm,
      shadowColor: t.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    btnText: {
      color: t.onPrimary,
      fontSize: t.font.lg,
      fontWeight: t.font.weight.bold as any,
    },
    linkRow: {
      flexDirection: "row",
      marginTop: t.spacing.xl,
    },
    linkText: {
      fontSize: t.font.md,
      color: t.textSecondary,
    },
    linkAccent: {
      fontSize: t.font.md,
      color: t.primary,
      fontWeight: t.font.weight.bold as any,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={s.safeArea}>
        <View style={s.inner}>
          <View style={s.iconContainer}>
            <Ionicons name="person-add" size={48} color={t.primary} />
          </View>
          <Text style={s.heading}>Create account</Text>
          <Text style={s.sub}>Start tracking your classes</Text>

          <View style={s.inputWrapper}>
            <Ionicons name="person-outline" size={20} style={s.inputIcon} accessibilityElementsHidden />
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor={t.textTertiary}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              accessibilityLabel="Full name"
              accessibilityHint="Enter your full name"
              textContentType="name"
              autoComplete="name"
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="mail-outline" size={20} style={s.inputIcon} accessibilityElementsHidden />
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={t.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>

          <View style={s.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} style={s.inputIcon} accessibilityElementsHidden />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={t.textTertiary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              accessibilityLabel="Password"
              accessibilityHint="Create a password (at least 6 characters)"
              textContentType="newPassword"
              autoComplete="new-password"
            />
          </View>

          <TouchableOpacity style={s.btn} onPress={onSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={t.onPrimary} />
            ) : (
              <Text style={s.btnText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={s.linkRow}>
            <Text style={s.linkText}>Have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={s.linkAccent}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
