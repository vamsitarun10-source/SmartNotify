import { useState, useEffect, useCallback } from "react";
import {
  listTimetable,
  createTimetable as apiCreate,
  updateTimetable as apiUpdate,
  deleteTimetable as apiDelete,
  generateEvents as apiGenerate,
  type TimetableEntry,
} from "../services/timetable";

export function useTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTimetable();
      setEntries(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: TimetableEntry) => {
      const created = await apiCreate(payload);
      setEntries((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const update = useCallback(
    async (id: string, payload: Partial<TimetableEntry>) => {
      const updated = await apiUpdate(id, payload);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
      return updated;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await apiDelete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const generate = useCallback(async (weeks: number = 4) => {
    const result = await apiGenerate(weeks);
    return result;
  }, []);

  return { entries, loading, error, refresh, create, update, remove, generate };
}
