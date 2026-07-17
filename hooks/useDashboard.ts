import { useState, useEffect, useCallback } from "react";
import { getDashboard, type DashboardData } from "../services/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getDashboard();
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}
