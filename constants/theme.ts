export type ThemeMode = "light" | "dark" | "amoled";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  danger: string;
  dangerContainer: string;
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;
  info: string;
  card: string;
  cardBorder: string;
  shadow: string;
  overlay: string;
  skeleton: string;
  skeletonShimmer: string;
  tabBar: string;
  tabBarInactive: string;
  inputBg: string;
  inputBorder: string;
  inputBorderFocus: string;
  divider: string;
}

export interface AppTheme extends ThemeColors {
  mode: ThemeMode;
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  font: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    hero: number;
    weight: {
      regular: "400";
      medium: "500";
      semibold: "600";
      bold: "700";
      extrabold: "800";
    };
  };
  shadow: {
    sm: object;
    md: object;
    lg: object;
  };
}

const shared = {
  radius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  font: {
    xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, hero: 32,
    weight: { regular: "400" as const, medium: "500" as const, semibold: "600" as const, bold: "700" as const, extrabold: "800" as const },
  },
};

const light: ThemeColors = {
  background: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceVariant: "#F0F0F5",
  primary: "#5C6BC0",
  primaryContainer: "#E8EAF6",
  onPrimary: "#FFFFFF",
  onPrimaryContainer: "#283593",
  secondary: "#26A69A",
  secondaryContainer: "#E0F2F1",
  onSecondary: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  danger: "#EF5350",
  dangerContainer: "#FFEBEE",
  success: "#66BB6A",
  successContainer: "#E8F5E9",
  warning: "#FFA726",
  warningContainer: "#FFF3E0",
  info: "#42A5F5",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  shadow: "rgba(0,0,0,0.06)",
  overlay: "rgba(0,0,0,0.4)",
  skeleton: "#E2E8F0",
  skeletonShimmer: "#F1F5F9",
  tabBar: "#FFFFFF",
  tabBarInactive: "#94A3B8",
  inputBg: "#F8FAFC",
  inputBorder: "#E2E8F0",
  inputBorderFocus: "#5C6BC0",
  divider: "#F1F5F9",
};

const dark: ThemeColors = {
  background: "#121212",
  surface: "#1E1E2E",
  surfaceVariant: "#252536",
  primary: "#7986CB",
  primaryContainer: "#283593",
  onPrimary: "#1A1A2E",
  onPrimaryContainer: "#C5CAE9",
  secondary: "#4DB6AC",
  secondaryContainer: "#00695C",
  onSecondary: "#1A1A2E",
  text: "#E8E8F0",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  border: "#2A2A3C",
  borderLight: "#1E1E2E",
  danger: "#EF5350",
  dangerContainer: "#4A1A1A",
  success: "#66BB6A",
  successContainer: "#1B3A1B",
  warning: "#FFA726",
  warningContainer: "#3D2A0A",
  info: "#42A5F5",
  card: "#1E1E2E",
  cardBorder: "#2A2A3C",
  shadow: "rgba(0,0,0,0.3)",
  overlay: "rgba(0,0,0,0.6)",
  skeleton: "#2A2A3C",
  skeletonShimmer: "#333346",
  tabBar: "#1E1E2E",
  tabBarInactive: "#64748B",
  inputBg: "#252536",
  inputBorder: "#2A2A3C",
  inputBorderFocus: "#7986CB",
  divider: "#252536",
};

const amoled: ThemeColors = {
  ...dark,
  background: "#000000",
  surface: "#0A0A0A",
  surfaceVariant: "#111111",
  card: "#0A0A0A",
  cardBorder: "#1A1A1A",
  tabBar: "#000000",
  inputBg: "#111111",
  inputBorder: "#1A1A1A",
  divider: "#111111",
  skeleton: "#1A1A1A",
  skeletonShimmer: "#222222",
};

export const themes: Record<ThemeMode, AppTheme> = {
  light: { ...light, ...shared, mode: "light", shadow: {
    sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  }},
  dark: { ...dark, ...shared, mode: "dark", shadow: {
    sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  }},
  amoled: { ...amoled, ...shared, mode: "amoled", shadow: {
    sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 },
    lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 6 },
  }},
};

export type { ThemeColors };
export const theme = themes.light;
export type Theme = AppTheme;
