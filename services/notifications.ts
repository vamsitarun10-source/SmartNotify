import notifee, { EventType, AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import type { Notification, NotificationTriggerInput } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { markAttendance } from "./events";
import api from "./api";

const SETTINGS_KEY = "app_settings";

// --- Channel IDs ---
const CHANNEL_ID = "classes";
const TASK_CHANNEL_ID = "tasks";
const ASSIGNMENT_CHANNEL_ID = "assignments";
const EXAM_CHANNEL_ID = "exams";

// --- Notification Map Keys ---
const NOTIFICATION_MAP_KEY = "notification_map";
const TASK_NOTIFICATION_MAP_KEY = "task_notification_map";
const ASSIGNMENT_NOTIFICATION_MAP_KEY = "assignment_notification_map";
const EXAM_NOTIFICATION_MAP_KEY = "exam_notification_map";

// --- Settings Reader (non-React, reads from AsyncStorage) ---
async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// --- Channel Setup ---
async function ensureChannels() {
  const settings = await getSettings();
  const vibration = settings.vibration !== false;
  const sound = settings.alarmSound || "default";
  const soundUri = sound === "silent" ? undefined : sound === "gentle" ? "default" : "default";
  const vibClass = vibration ? [0, 250, 250, 250] : undefined;
  const vibTask = vibration ? [0, 150, 100, 150] : undefined;
  const vibExam = vibration ? [0, 300, 200, 300, 200, 300] : undefined;

  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Class reminders",
      importance: AndroidImportance.HIGH,
      vibration,
      vibrationPattern: vibClass,
      sound: soundUri,
      lights: true,
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: TASK_CHANNEL_ID,
      name: "Task reminders",
      importance: AndroidImportance.DEFAULT,
      vibration,
      vibrationPattern: vibTask,
      sound: soundUri,
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: ASSIGNMENT_CHANNEL_ID,
      name: "Assignment reminders",
      importance: AndroidImportance.DEFAULT,
      vibration,
      vibrationPattern: vibTask,
      sound: soundUri,
      visibility: AndroidVisibility.PUBLIC,
    });
    await notifee.createChannel({
      id: EXAM_CHANNEL_ID,
      name: "Exam reminders",
      importance: AndroidImportance.HIGH,
      vibration,
      vibrationPattern: vibExam,
      sound: soundUri,
      lights: true,
      visibility: AndroidVisibility.PUBLIC,
    });
  } catch (e) {}
}

export async function requestNotificationPermission() {
  await ensureChannels();
  await notifee.requestPermission();
}

// --- Notification Map Helpers ---
async function getMap(key: string): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function saveMap(key: string, map: Record<string, string>) {
  await AsyncStorage.setItem(key, JSON.stringify(map));
}

// --- Android Config Builder ---
function buildAndroidConfig(channelId: string, actions: any[], fullScreen = false, data?: Record<string, any>) {
  const config: any = {
    channelId,
    smallIcon: "ic_launcher",
    pressAction: { id: "default" },
    actions,
    sound: "default",
    visibility: AndroidVisibility.PUBLIC,
    ...(data ? { data } : {}),
  };
  if (channelId === CHANNEL_ID || channelId === EXAM_CHANNEL_ID) {
    config.vibrationPattern = channelId === EXAM_CHANNEL_ID
      ? [0, 300, 200, 300, 200, 300]
      : [0, 250, 250, 250];
    config.lights = true;
  } else {
    config.vibrationPattern = [0, 150, 100, 150];
  }
  if (fullScreen) {
    config.fullScreenAction = { id: "full_screen", launchActivity: "com.classreminder" };
  }
  return config;
}

// --- Common Actions ---
const DISMISS_ACTION = { title: "Dismiss", pressAction: { id: "dismiss" } };
const SNOOZE_5_ACTION = { title: "Snooze 5m", pressAction: { id: "snooze_5" } };
const SNOOZE_10_ACTION = { title: "Snooze 10m", pressAction: { id: "snooze_10" } };
const ATTENDED_ACTION = { title: "Attended", pressAction: { id: "attended" } };
const MISSED_ACTION = { title: "Missed", pressAction: { id: "missed" } };
const OPEN_TIMETABLE_ACTION = { title: "Open Timetable", pressAction: { id: "open_timetable" } };

// --- Snooze Handler ---
export async function snoozeNotification(notificationId: string, snoozeMinutes: number) {
  try {
    const allNotifs = await notifee.getDisplayedNotifications();
    const found = allNotifs.find((n) => n.notification.id === notificationId);
    if (!found) return;

    const notif = found.notification;
    const data = (notif as any).data || {};
    const notifType = data.type || "class";
    const channelId =
      notifType === "class" ? CHANNEL_ID :
      notifType === "task" ? TASK_CHANNEL_ID :
      notifType === "assignment" ? ASSIGNMENT_CHANNEL_ID :
      EXAM_CHANNEL_ID;
    const titlePrefix =
      notifType === "class" ? "Class" :
      notifType === "task" ? "Task" :
      notifType === "assignment" ? "Assignment" : "Exam";

    await notifee.cancelNotification(notificationId);

    const snoozeTime = Date.now() + snoozeMinutes * 60000;
    const actions =
      notifType === "class"
        ? [DISMISS_ACTION, SNOOZE_5_ACTION, ATTENDED_ACTION]
        : notifType === "exam"
        ? [DISMISS_ACTION, SNOOZE_5_ACTION, ATTENDED_ACTION]
        : [DISMISS_ACTION, SNOOZE_5_ACTION];

    const snoozeNotifId = `snooze_${notifType}_${data.original_id || notificationId}_${Date.now()}`;

    await notifee.createTriggerNotification(
      {
        id: snoozeNotifId,
        title: `${titlePrefix} Reminder (Snoozed)`,
        body: notif.body || "",
        android: buildAndroidConfig(channelId, actions, notifType === "class" || notifType === "exam", data),
      },
      { type: "timestamp", timestamp: snoozeTime }
    );
  } catch (e) {}
}

// --- Dismiss Handler ---
export async function dismissNotification(notificationId: string) {
  await notifee.cancelNotification(notificationId);
}

// ===========================================
// CLASS NOTIFICATIONS
// ===========================================
export async function scheduleClassNotification(
  eventId: string,
  title: string,
  date: string,
  time: string,
  reminderBefore: number
): Promise<string | null> {
  const eventDate = new Date(date + "T" + time + ":00");
  const reminderDate = new Date(eventDate.getTime() - reminderBefore * 60000);
  if (reminderDate.getTime() <= Date.now()) return null;

  // Dedup: check if notification already exists for this event
  const map = await getMap(NOTIFICATION_MAP_KEY);
  if (map[eventId]) {
    try {
      await notifee.cancelNotification(map[eventId]);
    } catch {}
    delete map[eventId];
  }

  const data = { type: "class", original_id: eventId, title, date, time, reminder_before: reminderBefore };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: eventId,
      title: "SmartNotify",
      body: `${title} starts in ${reminderBefore} min`,
      android: buildAndroidConfig(CHANNEL_ID, [DISMISS_ACTION, SNOOZE_5_ACTION, ATTENDED_ACTION], true, data),
    },
    { type: "timestamp", timestamp: reminderDate.getTime() }
  );

  map[eventId] = notificationId;
  await saveMap(NOTIFICATION_MAP_KEY, map);
  return notificationId;
}

export async function cancelNotificationForEvent(eventId: string) {
  const map = await getMap(NOTIFICATION_MAP_KEY);
  if (map[eventId]) {
    await notifee.cancelNotification(map[eventId]);
    delete map[eventId];
    await saveMap(NOTIFICATION_MAP_KEY, map);
  }
}

export async function cancelAllNotifications() {
  await notifee.cancelAllNotifications();
  await AsyncStorage.removeItem(NOTIFICATION_MAP_KEY);
  await AsyncStorage.removeItem(TASK_NOTIFICATION_MAP_KEY);
  await AsyncStorage.removeItem(ASSIGNMENT_NOTIFICATION_MAP_KEY);
  await AsyncStorage.removeItem(EXAM_NOTIFICATION_MAP_KEY);
}

// ===========================================
// TASK NOTIFICATIONS
// ===========================================
export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDate: string,
  dueTime: string,
  reminderMinutes: number
): Promise<string | null> {
  if (!dueDate || !dueTime || reminderMinutes <= 0) return null;
  const dueDateTime = new Date(dueDate + "T" + dueTime + ":00");
  const reminderDate = new Date(dueDateTime.getTime() - reminderMinutes * 60000);
  if (reminderDate.getTime() <= Date.now()) return null;

  // Dedup: cancel existing notification for this task
  const taskMap = await getMap(TASK_NOTIFICATION_MAP_KEY);
  if (taskMap[taskId]) {
    try { await notifee.cancelNotification(taskMap[taskId]); } catch {}
    delete taskMap[taskId];
  }

  const data = { type: "task", original_id: taskId, title, date: dueDate, time: dueTime };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `task_${taskId}`,
      title: "Task Reminder",
      body: `"${title}" is due in ${reminderMinutes} min`,
      android: buildAndroidConfig(TASK_CHANNEL_ID, [DISMISS_ACTION, SNOOZE_5_ACTION], false, data),
    },
    { type: "timestamp", timestamp: reminderDate.getTime() }
  );

  const map = await getMap(TASK_NOTIFICATION_MAP_KEY);
  map[taskId] = notificationId;
  await saveMap(TASK_NOTIFICATION_MAP_KEY, map);
  return notificationId;
}

export async function cancelNotificationForTask(taskId: string) {
  const map = await getMap(TASK_NOTIFICATION_MAP_KEY);
  if (map[taskId]) {
    await notifee.cancelNotification(map[taskId]);
    delete map[taskId];
    await saveMap(TASK_NOTIFICATION_MAP_KEY, map);
  }
}

// ===========================================
// ASSIGNMENT NOTIFICATIONS
// ===========================================
export async function scheduleAssignmentReminder(
  assignmentId: string,
  title: string,
  dueDate: string,
  dueTime: string,
  reminderMinutes: number
): Promise<string | null> {
  if (!dueDate || !dueTime || reminderMinutes <= 0) return null;
  const dueDateTime = new Date(dueDate + "T" + dueTime + ":00");
  const reminderDate = new Date(dueDateTime.getTime() - reminderMinutes * 60000);
  if (reminderDate.getTime() <= Date.now()) return null;

  // Dedup: cancel existing notification for this assignment
  const assignMap = await getMap(ASSIGNMENT_NOTIFICATION_MAP_KEY);
  if (assignMap[assignmentId]) {
    try { await notifee.cancelNotification(assignMap[assignmentId]); } catch {}
    delete assignMap[assignmentId];
  }

  const data = { type: "assignment", original_id: assignmentId, title, date: dueDate, time: dueTime };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `assignment_${assignmentId}`,
      title: "Assignment Reminder",
      body: `"${title}" is due in ${reminderMinutes} min`,
      android: buildAndroidConfig(ASSIGNMENT_CHANNEL_ID, [DISMISS_ACTION, SNOOZE_5_ACTION], false, data),
    },
    { type: "timestamp", timestamp: reminderDate.getTime() }
  );

  const map = await getMap(ASSIGNMENT_NOTIFICATION_MAP_KEY);
  map[assignmentId] = notificationId;
  await saveMap(ASSIGNMENT_NOTIFICATION_MAP_KEY, map);
  return notificationId;
}

export async function cancelNotificationForAssignment(assignmentId: string) {
  const map = await getMap(ASSIGNMENT_NOTIFICATION_MAP_KEY);
  if (map[assignmentId]) {
    await notifee.cancelNotification(map[assignmentId]);
    delete map[assignmentId];
    await saveMap(ASSIGNMENT_NOTIFICATION_MAP_KEY, map);
  }
}

// ===========================================
// EXAM NOTIFICATIONS
// ===========================================
export async function scheduleExamReminder(
  examId: string,
  title: string,
  date: string,
  time: string,
  reminderMinutes: number
): Promise<string | null> {
  if (!date || !time || reminderMinutes <= 0) return null;
  const examDateTime = new Date(date + "T" + time + ":00");
  const reminderDate = new Date(examDateTime.getTime() - reminderMinutes * 60000);
  if (reminderDate.getTime() <= Date.now()) return null;

  // Dedup: cancel existing notification for this exam
  const examMap = await getMap(EXAM_NOTIFICATION_MAP_KEY);
  if (examMap[examId]) {
    try { await notifee.cancelNotification(examMap[examId]); } catch {}
    delete examMap[examId];
  }

  const data = { type: "exam", original_id: examId, title, date, time };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `exam_${examId}`,
      title: "Exam Reminder",
      body: `"${title}" starts in ${reminderMinutes} min`,
      android: buildAndroidConfig(EXAM_CHANNEL_ID, [DISMISS_ACTION, SNOOZE_5_ACTION, ATTENDED_ACTION], true, data),
    },
    { type: "timestamp", timestamp: reminderDate.getTime() }
  );

  const map = await getMap(EXAM_NOTIFICATION_MAP_KEY);
  map[examId] = notificationId;
  await saveMap(EXAM_NOTIFICATION_MAP_KEY, map);
  return notificationId;
}

export async function cancelNotificationForExam(examId: string) {
  const map = await getMap(EXAM_NOTIFICATION_MAP_KEY);
  if (map[examId]) {
    await notifee.cancelNotification(map[examId]);
    delete map[examId];
    await saveMap(EXAM_NOTIFICATION_MAP_KEY, map);
  }
}

// ===========================================
// EVENT LISTENERS
// ===========================================
export function setupNotificationListeners() {
  // Foreground handler
  notifee.onForegroundEvent(({ type, detail }) => {
    const actionId = detail.pressAction?.id;
    const notificationId = detail.notification?.id;
    if (!notificationId) return;

    if (type === EventType.PRESS) {
      handlePress(notificationId, detail);
    } else if (type === EventType.ACTION_PRESS) {
      handleAction(actionId || "", notificationId);
      notifee.cancelNotification(notificationId);
    } else if (type === EventType.DISMISSED) {
      handleDismiss(notificationId);
    }
  });

  // Background handler (app in background)
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const actionId = detail.pressAction?.id;
    const notificationId = detail.notification?.id;
    if (!notificationId) return;

    if (type === EventType.PRESS) {
      handlePress(notificationId, detail);
    } else if (type === EventType.ACTION_PRESS) {
      await handleAction(actionId || "", notificationId);
      await notifee.cancelNotification(notificationId);
    } else if (type === EventType.DISMISSED) {
      await handleDismiss(notificationId);
    }
  });
}

async function handlePress(notificationId: string, detail: any) {
  const data = detail.notification?.data || detail.notification?.android?.data;
  if (!data) return;
  if (data.type === "class" || data.type === "exam") {
    try {
      await api.post("/ai/chat", { message: `What is my next class?` }).catch(() => {});
    } catch {}
  }
}

async function handleAction(actionId: string, notificationId: string) {
  switch (actionId) {
    case "dismiss":
      await dismissNotification(notificationId);
      break;

    case "snooze_5":
      await snoozeNotification(notificationId, 5);
      break;

    case "snooze_10":
      await snoozeNotification(notificationId, 10);
      break;

    case "snooze_15":
      await snoozeNotification(notificationId, 15);
      break;

    case "attended":
      try {
        const allNotifs = await notifee.getDisplayedNotifications();
        const found = allNotifs.find((n) => n.notification.id === notificationId);
        const data = (found?.notification as any)?.data || (found?.notification as any)?.android?.data;
        const originalId = data?.original_id;
        if (originalId) {
          await markAttendance(originalId, true);
        }
      } catch {}
      break;

    case "missed":
      try {
        const allNotifs2 = await notifee.getDisplayedNotifications();
        const found2 = allNotifs2.find((n) => n.notification.id === notificationId);
        const data2 = (found2?.notification as any)?.data || (found2?.notification as any)?.android?.data;
        const originalId2 = data2?.original_id;
        if (originalId2) {
          await markAttendance(originalId2, false);
        }
      } catch {}
      break;

    case "open_timetable":
      // Navigation handled by deep link or app open
      break;
  }
}

async function handleDismiss(notificationId: string) {
  // Clean up maps on dismiss
  for (const key of [NOTIFICATION_MAP_KEY, TASK_NOTIFICATION_MAP_KEY, ASSIGNMENT_NOTIFICATION_MAP_KEY, EXAM_NOTIFICATION_MAP_KEY]) {
    const map = await getMap(key);
    for (const [id, notifId] of Object.entries(map)) {
      if (notifId === notificationId) {
        delete map[id];
        await saveMap(key, map);
        return;
      }
    }
  }
}
