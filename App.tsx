import React, { useEffect, Suspense, lazy, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, StatusBar, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ThemeProvider, useAppTheme } from "./constants/ThemeContext";
import { SettingsProvider } from "./constants/SettingsContext";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import { requestNotificationPermission, setupNotificationListeners } from "./services/notifications";
import ErrorBoundary from "./components/ErrorBoundary";
import SyncStatus from "./components/SyncStatus";
import RateAppDialog from "./components/RateAppDialog";
import WhatsNewDialog from "./components/WhatsNewDialog";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { processQueue } from "./services/syncQueue";
import api from "./services/api";
import OnboardingScreen, { isOnboardingComplete } from "./app/OnboardingScreen";
import { incrementLaunchCount } from "./components/RateAppDialog";

// Eager imports
import Login from "./app/Login";
import Register from "./app/Register";
import Home from "./app/Home";

// Lazy imports
const Calendar = lazy(() => import("./app/Calendar"));
const Profile = lazy(() => import("./app/Profile"));
const Tasks = lazy(() => import("./app/Tasks"));
const Assignments = lazy(() => import("./app/Assignments"));
const Exams = lazy(() => import("./app/Exams"));
const Timetable = lazy(() => import("./app/Timetable"));
const Attendance = lazy(() => import("./app/Attendance"));
const Statistics = lazy(() => import("./app/Statistics"));
const AddEvent = lazy(() => import("./app/AddEvent"));
const EditEvent = lazy(() => import("./app/EditEvent"));
const AddCalendarEvent = lazy(() => import("./app/AddCalendarEvent"));
const AddTask = lazy(() => import("./app/AddTask"));
const EditTask = lazy(() => import("./app/EditTask"));
const AddAssignment = lazy(() => import("./app/AddAssignment"));
const EditAssignment = lazy(() => import("./app/EditAssignment"));
const AddExam = lazy(() => import("./app/AddExam"));
const EditExam = lazy(() => import("./app/EditExam"));
const Notes = lazy(() => import("./app/Notes"));
const AddNote = lazy(() => import("./app/AddNote"));
const EditNote = lazy(() => import("./app/EditNote"));
const GlobalSearch = lazy(() => import("./app/GlobalSearch"));
const Backup = lazy(() => import("./app/Backup"));
const Settings = lazy(() => import("./app/Settings"));
const Rewards = lazy(() => import("./app/Rewards"));
const PrivacyPolicy = lazy(() => import("./app/PrivacyPolicy"));
const About = lazy(() => import("./app/About"));
const Feedback = lazy(() => import("./app/Feedback"));

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingFallback() {
  const { theme: t } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={t.primary} />
    </View>
  );
}

function MainTabs() {
  const { theme: t } = useAppTheme();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: t.primary,
          tabBarInactiveTintColor: t.tabBarInactive,
          tabBarStyle: {
            backgroundColor: t.tabBar,
            borderTopColor: t.divider,
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: t.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tab.Screen name="Home" component={Home} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="school" color={color} size={22} /> }} />
        <Tab.Screen name="Calendar" component={Calendar} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={22} /> }} />
        <Tab.Screen name="Tasks" component={Tasks} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" color={color} size={22} /> }} />
        <Tab.Screen name="Assignments" component={Assignments} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="document-text" color={color} size={22} /> }} />
        <Tab.Screen name="Exams" component={Exams} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="school" color={color} size={22} /> }} />
        <Tab.Screen name="Timetable" component={Timetable} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="repeat" color={color} size={22} /> }} />
        <Tab.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={22} /> }} />
        <Tab.Screen name="Attendance" component={Attendance} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="analytics" color={color} size={22} /> }} />
        <Tab.Screen name="Statistics" component={Statistics} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={22} /> }} />
        <Tab.Screen name="Rewards" component={Rewards} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="trophy" color={color} size={22} /> }} />
      </Tab.Navigator>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { theme: t } = useAppTheme();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    incrementLaunchCount();
    isOnboardingComplete().then(setOnboardingDone);
    requestNotificationPermission();
    setupNotificationListeners();
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline.current) {
      processQueue(api).then(({ processed }) => {
        if (processed > 0) {
          // Trigger data refresh by navigating or refreshing
        }
      });
    }
    wasOffline.current = !isOnline;
  }, [isOnline]);

  if (onboardingDone === null || isAuthenticated === null) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={t.mode === "light" ? "dark-content" : "light-content"} backgroundColor={t.background} />
      <SyncStatus />
      <RateAppDialog />
      <WhatsNewDialog />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: t.background },
            animation: "slide_from_right",
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={Login} options={{ animation: "fade" }} />
              <Stack.Screen name="Register" component={Register} options={{ animation: "slide_from_right" }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} options={{ animation: "fade" }} />
              <Suspense fallback={<LoadingFallback />}>
                <Stack.Screen name="AddEvent" component={AddEvent} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="EditEvent" component={EditEvent} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="AddCalendarEvent" component={AddCalendarEvent} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="AddTask" component={AddTask} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="EditTask" component={EditTask} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="AddAssignment" component={AddAssignment} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="EditAssignment" component={EditAssignment} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="AddExam" component={AddExam} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="EditExam" component={EditExam} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="Notes" component={Notes} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="AddNote" component={AddNote} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="EditNote" component={EditNote} options={{ animation: "slide_from_bottom" }} />
                <Stack.Screen name="GlobalSearch" component={GlobalSearch} options={{ animation: "fade" }} />
                <Stack.Screen name="Backup" component={Backup} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="Settings" component={Settings} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="About" component={About} options={{ animation: "slide_from_right" }} />
                <Stack.Screen name="Feedback" component={Feedback} options={{ animation: "slide_from_right" }} />
              </Suspense>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
