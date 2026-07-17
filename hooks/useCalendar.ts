import { useState, useEffect, useCallback } from "react";
import {
  listCalendarEvents,
  createCalendarEvent as apiCreate,
  updateCalendarEvent as apiUpdate,
  deleteCalendarEvent as apiDelete,
  type CalendarEvent,
} from "../services/calendar";

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCalendarEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (payload: CalendarEvent) => {
    const created = await apiCreate(payload);
    setEvents((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (id: string, payload: Partial<CalendarEvent>) => {
    const updated = await apiUpdate(id, payload);
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { events, loading, error, refresh, create, update, remove };
}
