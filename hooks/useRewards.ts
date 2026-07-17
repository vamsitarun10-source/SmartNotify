import { useState, useEffect, useCallback } from "react";
import { getRewards, addXp as apiAddXp, type RewardData } from "../services/rewards";

export function useRewards() {
  const [data, setData] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getRewards();
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addXp = useCallback(async (amount: number, reason: string) => {
    const result = await apiAddXp(amount, reason);
    await refresh();
    return result;
  }, [refresh]);

  return { data, loading, error, refresh, addXp };
}
