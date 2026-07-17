import { useState, useEffect, useCallback } from "react";
import {
  getAttendanceSummary,
  markAttendance as apiMark,
  type AttendanceSummary,
  type ClassEvent,
} from "../services/events";

export function useAttendance() {
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceSummary();
      setSummary(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mark = useCallback(
    async (eventId: string, attended: boolean): Promise<ClassEvent> => {
      const updated = await apiMark(eventId, attended);
      await refresh();
      return updated;
    },
    [refresh]
  );

  return { summary, loading, error, refresh, mark };
}
