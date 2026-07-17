import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  onRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={64} color="#EF5350" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.onRestart} activeOpacity={0.8}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F5F7", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#1A1A2E", marginTop: 16, marginBottom: 8 },
  message: { fontSize: 15, color: "#64748B", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  btn: { backgroundColor: "#5C6BC0", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
