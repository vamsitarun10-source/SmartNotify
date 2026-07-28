import { useState, useEffect, useCallback } from "react";
import {
  listEvents,
  createEvent as apiCreate,
  updateEvent as apiUpdate,
  deleteEvent as apiDelete,
  type ClassEvent,
} from "../services/events";
import {
  scheduleClassNotification,
  cancelNotificationForEvent,
} from "../services/notifications";

export function useEvents() {
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (payload: ClassEvent) => {
    console.log("[FLOW] useEvents.create: calling apiCreate", { title: payload.title, date: payload.date, time: payload.time, reminder_before: payload.reminder_before });
    const created = await apiCreate(payload);
    console.log("[FLOW] useEvents.create: apiCreate returned", { id: created?.id, title: created?.title, date: created?.date, time: created?.time, reminder_before: created?.reminder_before });
    
    console.log("[FLOW] useEvents.create: about to call scheduleClassNotification", { eventId: created.id, title: created.title, date: created.date, time: created.time, reminderBefore: created.reminder_before });
    const notifPromise = scheduleClassNotification(
      created.id || "",
      created.title,
      created.date,
      created.time,
      created.reminder_before
    );
    console.log("[FLOW] useEvents.create: scheduleClassNotification called (fire-and-forget)");
    notifPromise.then(
      (result) => console.log("[FLOW] useEvents.create: scheduleClassNotification resolved", { result }),
      (err) => console.log("[FLOW] useEvents.create: scheduleClassNotification rejected", { err: String(err) })
    );
    
    setEvents((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, payload: Partial<ClassEvent>) => {
    await cancelNotificationForEvent(id);
    const updated = await apiUpdate(id, payload);
    if (updated.id) {
      scheduleClassNotification(
        updated.id,
        updated.title,
        updated.date,
        updated.time,
        updated.reminder_before
      );
    }
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    try { await cancelNotificationForEvent(id); } catch {}
    await apiDelete(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, loading, error, refresh, create, update, remove };
}
