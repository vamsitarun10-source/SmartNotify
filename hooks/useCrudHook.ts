import { useState, useEffect, useCallback } from "react";
import { enqueueRequest, processQueue, onQueueChange, getQueueLength } from "../services/syncQueue";
import { cacheData, readCache } from "../services/cacheManager";
import api from "../services/api";

type CrudService<T> = {
  list: () => Promise<T[]>;
  create: (payload: T) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  toggle?: (id: string) => Promise<T>;
};

export function createCrudHook<T extends { id?: string }>(service: CrudService<T>, cacheKey: string, dataKey: string) {
  return function useCrud() {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
      const unsub = onQueueChange(async () => {
        const count = await getQueueLength();
        setPendingCount(count);
        if (count === 0) {
          refresh();
        }
      });
      return unsub;
    }, []);

    const refresh = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await service.list();
        setItems(data);
        await cacheData(cacheKey, data);
        setError(null);
      } catch {
        const cached = await readCache<T[]>(cacheKey);
        if (cached) {
          setItems(cached);
          setError("Offline — showing cached data");
        } else {
          setError("Failed to load. Check your connection.");
        }
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      refresh();
    }, [refresh]);

    const create = useCallback(async (payload: T) => {
      try {
        const created = await service.create(payload);
        setItems((prev) => [created, ...prev]);
        await cacheData(cacheKey, [created, ...items]);
        return created;
      } catch {
        await enqueueRequest("POST", "/tasks/", payload);
        setItems((prev) => [{ ...payload, id: `pending_${Date.now()}` } as T, ...prev]);
        return payload;
      }
    }, [items, cacheKey]);

    const update = useCallback(async (id: string, payload: Partial<T>) => {
      const prev = [...items];
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
      try {
        const updated = await service.update(id, payload);
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
        return updated;
      } catch {
        const endpoint = cacheKey === "cache_tasks" ? `/tasks/${id}` : cacheKey === "cache_assignments" ? `/assignments/${id}` : `/events/${id}`;
        await enqueueRequest("PUT", endpoint, payload);
        setItems((p) => { setTimeout(() => setItems(prev), 0); return p; });
        return payload as T;
      }
    }, [items, cacheKey]);

    const remove = useCallback(async (id: string) => {
      const prev = [...items];
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        await service.remove(id);
      } catch {
        const endpoint = cacheKey === "cache_tasks" ? `/tasks/${id}` : cacheKey === "cache_assignments" ? `/assignments/${id}` : `/events/${id}`;
        await enqueueRequest("DELETE", endpoint, null);
      }
    }, [items, cacheKey]);

    const toggle = useCallback(async (id: string) => {
      if (!service.toggle) throw new Error("Toggle not supported");
      setItems((prev) => prev.map((item) => {
        if (item.id === id) {
          const toggled = { ...item, completed: !(item as any).completed } as T;
          return toggled;
        }
        return item;
      }));
      try {
        const updated = await service.toggle(id);
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
        return updated;
      } catch {
        const endpoint = cacheKey === "cache_tasks" ? `/tasks/${id}/toggle` : cacheKey === "cache_assignments" ? `/assignments/${id}/toggle` : `/events/${id}/toggle`;
        await enqueueRequest("PUT", endpoint, null);
        return {} as T;
      }
    }, [items, cacheKey]);

    return { [dataKey]: items, loading, error, pendingCount, refresh, create, update, remove, toggle };
  };
}
