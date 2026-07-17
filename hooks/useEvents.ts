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
  cancelAllNotifications,
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
    const created = await apiCreate(payload);
    try {
      await scheduleClassNotification(
        created.id || "",
        created.title,
        created.date,
        created.time,
        created.reminder_before
      );
    } catch {}
    setEvents((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, payload: Partial<ClassEvent>) => {
    try { await cancelNotificationForEvent(id); } catch {}
    const updated = await apiUpdate(id, payload);
    if (updated.id) {
      try {
        await scheduleClassNotification(
          updated.id,
          updated.title,
          updated.date,
          updated.time,
          updated.reminder_before
        );
      } catch {}
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
