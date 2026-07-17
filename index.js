import { AppRegistry } from "react-native";
import notifee, { EventType } from "@notifee/react-native";
import App from "./App";

AppRegistry.registerComponent("ClassReminder", () => App);

// Background event handler — fires even when app is killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const actionId = detail.pressAction?.id;
  const notificationId = detail.notification?.id;
  if (!notificationId) return;

  if (type === EventType.PRESS) {
    // App opens — navigation handled by deep link
  } else if (type === EventType.ACTION_PRESS) {
    const data = (detail.notification as any)?.data || (detail.notification as any)?.android?.data;

    if (actionId === "dismiss") {
      await notifee.cancelNotification(notificationId);
    }

    if (actionId === "snooze_5" || actionId === "snooze_10" || actionId === "snooze_15") {
      const minutes = actionId === "snooze_5" ? 5 : actionId === "snooze_10" ? 10 : 15;
      const notifType = data?.type || "class";
      const channelId =
        notifType === "class" ? "classes" :
        notifType === "task" ? "tasks" :
        notifType === "assignment" ? "assignments" : "exams";

      await notifee.cancelNotification(notificationId);

      const snoozeId = `snooze_${notifType}_${data?.original_id || ""}_${Date.now()}`;
      await notifee.createTriggerNotification(
        {
          id: snoozeId,
          title: detail.notification?.title || "Reminder",
          body: detail.notification?.body || "",
          android: {
            channelId,
            smallIcon: "ic_launcher",
            pressAction: { id: "default" },
            actions: [
              { title: "Dismiss", pressAction: { id: "dismiss" } },
              { title: "Snooze 5m", pressAction: { id: "snooze_5" } },
            ],
            sound: "default",
          },
        },
        { type: "timestamp", timestamp: Date.now() + minutes * 60000 }
      );
    }

    if (actionId === "attended") {
      const originalId = data?.original_id;
      if (originalId) {
        try {
          const AsyncStorage = require("@react-native-async-storage/async-storage").default;
          // Read encrypted token (stored at enc_auth_token)
          const raw = await AsyncStorage.getItem("enc_auth_token");
          if (raw) {
            const decoded = decodeURIComponent(atob(raw));
            const token = decoded.split("::")[0];
            if (token) {
              await fetch(`${__DEV__ ? "http://10.0.2.2:8000" : "https://api.classreminder.app"}/events/${originalId}/attendance`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ attended: true }),
              });
            }
          }
        } catch {}
      }
    }

    if (actionId === "missed") {
      const originalId = data?.original_id;
      if (originalId) {
        try {
          const AsyncStorage = require("@react-native-async-storage/async-storage").default;
          const raw = await AsyncStorage.getItem("enc_auth_token");
          if (raw) {
            const decoded = decodeURIComponent(atob(raw));
            const token = decoded.split("::")[0];
            if (token) {
              await fetch(`${__DEV__ ? "http://10.0.2.2:8000" : "https://api.classreminder.app"}/events/${originalId}/attendance`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ attended: false }),
              });
            }
          }
        } catch {}
      }
    }

    await notifee.cancelNotification(notificationId);
  }
});
