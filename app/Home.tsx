import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../constants/ThemeContext";
import { useEvents } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import { chat } from "../services/ai";
import { scheduleClassNotification } from "../services/notifications";
import { markAttendance } from "../services/events";
import { useTodayTasks } from "../hooks/useTasks";
import { toggleTask } from "../services/tasks";
import { useUpcomingAssignments } from "../hooks/useAssignments";
import { useUpcomingExams } from "../hooks/useExams";
import { useDashboard } from "../hooks/useDashboard";
import { useWidgetOrder } from "../hooks/useWidgetOrder";
import { useRewards } from "../hooks/useRewards";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { enqueueRequest } from "../services/syncQueue";
import ChatBubble from "../components/ChatBubble";
import EventCard from "../components/EventCard";
import DashboardCard from "../components/DashboardCard";
import OfflineBanner from "../components/OfflineBanner";
import AnimatedFAB from "../components/AnimatedFAB";
import WelcomeWidget from "../components/widgets/WelcomeWidget";
import NextClassWidget from "../components/widgets/NextClassWidget";
import WeeklyAttendanceWidget from "../components/widgets/WeeklyAttendanceWidget";
import WeeklyProductivityWidget from "../components/widgets/WeeklyProductivityWidget";
import ExamsWidget from "../components/widgets/ExamsWidget";
import AssignmentsWidget from "../components/widgets/AssignmentsWidget";
import NotesWidget from "../components/widgets/NotesWidget";
import FreeTimeWidget from "../components/widgets/FreeTimeWidget";
import StudyHoursWidget from "../components/widgets/StudyHoursWidget";
import AiSuggestionsWidget from "../components/widgets/AiSuggestionsWidget";
import QuickActionsWidget from "../components/widgets/QuickActionsWidget";
import AttendanceCheckWidget from "../components/widgets/AttendanceCheckWidget";

type Message = { id: string; role: "user" | "bot"; text: string };

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { events, refresh } = useEvents();
  const { user } = useAuth();
  const { theme: t } = useAppTheme();
  const { data: dashboard } = useDashboard();
  const { tasks: todayTasks, refresh: refreshTasks } = useTodayTasks();
  const { assignments: upcomingAssignments } = useUpcomingAssignments();
  const { exams: upcomingExams } = useUpcomingExams();
  const { order, moveUp, moveDown } = useWidgetOrder();
  const { data: rewards } = useRewards();
  const isOnline = useOnlineStatus();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const msgId = useRef(0);
  const chatRef = useRef<View>(null);

  const todayEvents = useMemo(() => events.filter((e) => isToday(e.date)), [events]);
  const upcomingEvents = useMemo(
    () => events.filter((e) => !isToday(e.date)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [events]
  );
  const nextEvent = upcomingEvents[0] || null;

  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!nextEvent) { setCountdown(""); return; }
    const update = () => {
      const diff = new Date(nextEvent.date + "T" + nextEvent.time + ":00").getTime() - Date.now();
      if (diff <= 0) { setCountdown("Now"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
      setCountdown(parts.join(" "));
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());
  const handleMarkAttendance = async (eventId: string, attended: boolean) => {
    try { await markAttendance(eventId, attended); setMarkedIds((prev) => new Set(prev).add(eventId)); refresh(); } catch {}
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsgId = String(++msgId.current);
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", text }]);
    setSending(true);
    try {
      if (!isOnline) {
        await enqueueRequest("POST", "/ai/chat", { message: text });
        setMessages((prev) => [...prev, { id: String(++msgId.current), role: "bot", text: "Your message has been queued and will be sent when you're back online." }]);
        setSending(false);
        return;
      }
      const res = await chat(text);
      setMessages((prev) => [...prev, { id: String(++msgId.current), role: "bot", text: res.reply }]);
      if (res.action === "created" || res.action === "updated" || res.action === "reminder_updated") {
        if (res.event) { try { await scheduleClassNotification(res.event.id || "", res.event.title, res.event.date, res.event.time, res.event.reminder_before); } catch {} }
        refresh();
      } else if (res.action === "deleted") { refresh(); } else if (res.events?.length) { refresh(); }
    } catch {
      setMessages((prev) => [...prev, { id: String(++msgId.current), role: "bot", text: "Sorry, I could not process that. Please try again." }]);
    } finally { setSending(false); }
  };

  const quickActions = [
    { icon: "add-circle", label: "Add Class", color: t.primary, action: () => navigation.navigate("AddEvent") },
    { icon: "repeat", label: "Timetable", color: t.secondary, action: () => navigation.navigate("Timetable") },
    { icon: "chatbubble-ellipses", label: "AI Chat", color: t.info, action: () => chatRef.current?.measure?.(() => {}) },
    { icon: "document-text", label: "Notes", color: t.warning, action: () => navigation.navigate("Notes") },
    { icon: "cloud-upload", label: "Backup", color: t.success, action: () => navigation.navigate("Backup") },
  ];

  const WIDGET_LABELS: Record<string, string> = {
    welcome: "Welcome & Clock", nextClass: "Next Class", quickActions: "Quick Actions",
    attendance: "Weekly Attendance", productivity: "Weekly Productivity",
    aiSuggestions: "AI Suggestions", exams: "This Week's Exams", assignments: "Upcoming Assignments",
    freeTime: "Free Time Today", studyHours: "Study Hours", recentNotes: "Recent Notes",
    attendanceCheck: "Attendance Check", rewards: "Rewards",
  };

  const renderWidget = (key: string, delay: number) => {
    switch (key) {
      case "welcome": return <DashboardCard key={key} delay={delay}><WelcomeWidget /></DashboardCard>;
      case "nextClass": return <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Next Class</Text><NextClassWidget nextEvent={nextEvent} countdown={countdown} /></DashboardCard>;
      case "quickActions": return <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Quick Actions</Text><QuickActionsWidget actions={quickActions} /></DashboardCard>;
      case "attendance": return dashboard ? <DashboardCard key={key} delay={delay}><WeeklyAttendanceWidget subjects={dashboard.attendance.subjects} overallPct={dashboard.attendance.overall_pct} /></DashboardCard> : null;
      case "productivity": return dashboard ? <DashboardCard key={key} delay={delay}><WeeklyProductivityWidget productivity={dashboard.productivity} /></DashboardCard> : null;
      case "aiSuggestions": return dashboard ? <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>AI Suggestions</Text><AiSuggestionsWidget suggestions={dashboard.suggestions} /></DashboardCard> : null;
      case "exams": return dashboard && dashboard.exams_this_week.length > 0 ? <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>This Week's Exams</Text><ExamsWidget exams={dashboard.exams_this_week} /></DashboardCard> : null;
      case "assignments": return dashboard && dashboard.upcoming_assignments.length > 0 ? <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Upcoming Assignments</Text><AssignmentsWidget assignments={dashboard.upcoming_assignments} /></DashboardCard> : null;
      case "freeTime": return dashboard ? <DashboardCard key={key} delay={delay}><FreeTimeWidget periods={dashboard.free_periods} count={dashboard.free_periods_count} /></DashboardCard> : null;
      case "studyHours": return dashboard ? <DashboardCard key={key} delay={delay}><StudyHoursWidget hours={dashboard.study_hours} /></DashboardCard> : null;
      case "recentNotes": return dashboard && dashboard.recent_notes.length > 0 ? <DashboardCard key={key} delay={delay}><Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Recent Notes</Text><NotesWidget notes={dashboard.recent_notes} /></DashboardCard> : null;
      case "attendanceCheck": return todayEvents.some((e) => e.attended === null || e.attended === undefined) ? <DashboardCard key={key} delay={delay}><AttendanceCheckWidget events={todayEvents.filter((e) => (e.attended === null || e.attended === undefined) && new Date(e.date + "T" + e.time + ":00").getTime() < Date.now())} onMark={handleMarkAttendance} markedIds={markedIds} /></DashboardCard> : null;
      case "rewards": return rewards ? (
        <TouchableOpacity key={key} activeOpacity={0.7} onPress={() => navigation.navigate("Rewards")}>
          <DashboardCard delay={delay} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFD700" + "25", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="trophy" size={22} color="#FFD700" />
              </View>
              <View>
                <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Level {rewards.level}</Text>
                <Text style={{ fontSize: t.font.xs, color: t.textSecondary }}>{rewards.xp} XP • {rewards.daily_streak} day streak</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.xs }}>
              <Ionicons name="flame" size={16} color="#FF5722" />
              <Text style={{ fontSize: t.font.sm, fontWeight: t.font.weight.bold, color: t.text }}>{rewards.daily_streak}</Text>
              <Ionicons name="chevron-forward" size={16} color={t.textTertiary} />
            </View>
          </DashboardCard>
        </TouchableOpacity>
      ) : null;
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <OfflineBanner />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: t.spacing.md, paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", backgroundColor: t.surface, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.cardBorder, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm + 4, marginBottom: t.spacing.md, gap: t.spacing.sm, ...t.shadow.sm }}
          onPress={() => navigation.navigate("GlobalSearch")} activeOpacity={0.7}
          accessibilityLabel="Search everything" accessibilityHint="Opens search across all data" accessibilityRole="button"
        >
          <Ionicons name="search" size={18} color={t.textTertiary} />
          <Text style={{ fontSize: t.font.md, color: t.textTertiary, flex: 1 }}>Search everything...</Text>
          <Ionicons name="mic" size={18} color={t.textTertiary} />
        </TouchableOpacity>

        {/* Reorder Toggle */}
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginBottom: t.spacing.sm }}
          onPress={() => setShowReorder(!showReorder)} activeOpacity={0.7}
          accessibilityLabel={showReorder ? "Done reordering" : "Reorder widgets"}
          accessibilityRole="button"
        >
          <Ionicons name={showReorder ? "checkmark" : "reorder-two"} size={16} color={t.primary} />
          <Text style={{ fontSize: t.font.xs, color: t.primary, fontWeight: t.font.weight.semibold }}>{showReorder ? "Done" : "Reorder"}</Text>
        </TouchableOpacity>

        {/* Dynamic Widget Order */}
        {order.map((key, index) => {
          const widget = renderWidget(key, index * 80);
          if (!widget) return null;
          if (showReorder) {
            return (
              <View key={key} style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>{widget}</View>
                <View style={{ flexDirection: "column", gap: 2, marginLeft: 4 }}>
                  <TouchableOpacity onPress={() => moveUp(index)} style={{ padding: 4, opacity: index > 0 ? 1 : 0.3 }} disabled={index === 0}>
                    <Ionicons name="chevron-up" size={18} color={t.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveDown(index)} style={{ padding: 4, opacity: index < order.length - 1 ? 1 : 0.3 }} disabled={index >= order.length - 1}>
                    <Ionicons name="chevron-down" size={18} color={t.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return widget;
        })}

        {/* Today's Classes */}
        {todayEvents.length > 0 && (
          <DashboardCard delay={600}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: t.spacing.sm }}>
              <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text }}>Today's Classes</Text>
              <View style={{ backgroundColor: t.primaryContainer, borderRadius: t.radius.full, paddingHorizontal: t.spacing.sm, paddingVertical: 2 }}>
                <Text style={{ fontSize: t.font.xs, fontWeight: "700", color: t.primary }}>{todayEvents.length}</Text>
              </View>
            </View>
            {todayEvents.map((e) => <EventCard key={e.id || e.title} event={e} />)}
          </DashboardCard>
        )}

        {/* AI Chat */}
        <View ref={chatRef}>
          <DashboardCard delay={680}>
            <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>AI Assistant</Text>
            <View style={{ minHeight: 60, marginVertical: t.spacing.xs }}>
              {messages.length === 0 ? (
                <View style={{ paddingVertical: t.spacing.sm, alignItems: "center" }}>
                  <Ionicons name="sparkles" size={24} color={t.primary} />
                  <Text style={{ color: t.textTertiary, fontSize: t.font.sm, marginTop: 6, textAlign: "center" }}>Try: "What is my next class?" or "How many assignments are pending?"</Text>
                </View>
              ) : messages.map((m) => <ChatBubble key={m.id} message={m.text} role={m.role} />)}
              {sending ? <ActivityIndicator color={t.primary} style={{ marginTop: 8 }} /> : null}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: t.spacing.sm }}>
              <TextInput
                style={{ flex: 1, backgroundColor: t.inputBg, borderWidth: 1, borderColor: t.inputBorder, borderRadius: t.radius.md, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.sm + 2, fontSize: t.font.md, color: t.text }}
                placeholder="Ask me anything..." placeholderTextColor={t.textTertiary} value={input} onChangeText={setInput} onSubmitEditing={sendMessage} returnKeyType="send"
                accessibilityLabel="AI chat message"
              />
              <TouchableOpacity style={{ marginLeft: t.spacing.sm, backgroundColor: t.primary, width: 44, height: 44, borderRadius: t.radius.md, alignItems: "center", justifyContent: "center" }} onPress={sendMessage} disabled={sending} activeOpacity={0.7} accessibilityLabel="Send message" accessibilityRole="button">
                <Ionicons name="send" size={20} color={t.onPrimary} />
              </TouchableOpacity>
            </View>
          </DashboardCard>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <DashboardCard delay={760}>
            <Text style={{ fontSize: t.font.lg, fontWeight: t.font.weight.bold, color: t.text, marginBottom: t.spacing.sm }}>Upcoming</Text>
            {upcomingEvents.slice(0, 5).map((e) => <EventCard key={e.id || e.title} event={e} />)}
          </DashboardCard>
        )}
      </ScrollView>

      {/* FAB */}
      <AnimatedFAB
        onPress={() => navigation.navigate("AddEvent")}
        backgroundColor={t.primary}
        entranceDelay={800}
        accessibilityLabel="Add new class"
        accessibilityHint="Opens the add class form"
        accessibilityRole="button"
      />
    </KeyboardAvoidingView>
  );
}
