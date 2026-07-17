import { createCrudHook } from "./useCrudHook";
import {
  listNotes as apiList,
  createNote as apiCreate,
  updateNote as apiUpdate,
  deleteNote as apiDelete,
  togglePin as apiToggle,
  getNoteSubjects,
  type Note,
} from "../services/notes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "cached_notes";

async function readCache(): Promise<Note[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function writeCache(data: Note[]) {
  try { await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

const service = {
  list: apiList,
  create: apiCreate,
  update: apiUpdate,
  remove: apiDelete,
  toggle: apiToggle,
};

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  const refresh = useCallback(async (q?: string, subject?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiList(q || undefined, subject || undefined);
      setNotes(data);
      await writeCache(data);
    } catch (e: any) {
      const cached = await readCache();
      if (cached.length > 0) {
        setNotes(cached);
        setError("Offline — showing cached notes");
      } else {
        setError(e?.message || "Failed to load notes");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSubjects = useCallback(async () => {
    try { setSubjects(await getNoteSubjects()); } catch {}
  }, []);

  useEffect(() => {
    refresh(searchQuery, filterSubject || undefined);
    refreshSubjects();
  }, []);

  const doSearch = useCallback(async (q: string, subject?: string) => {
    setSearchQuery(q);
    if (subject !== undefined) setFilterSubject(subject);
    await refresh(q, subject || filterSubject || undefined);
  }, [refresh, filterSubject]);

  const create = useCallback(async (payload: Note) => {
    try {
      const created = await apiCreate(payload);
      setNotes((prev) => [created, ...prev]);
      await writeCache([created, ...notes]);
      refreshSubjects();
      return created;
    } catch { throw new Error("Offline — cannot create notes"); }
  }, [notes]);

  const update = useCallback(async (id: string, payload: Partial<Note>) => {
    try {
      const updated = await apiUpdate(id, payload);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
      refreshSubjects();
      return updated;
    } catch { throw new Error("Offline — cannot update notes"); }
  }, []);

  const remove = useCallback(async (id: string) => {
    const prev = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try { await apiDelete(id); } catch { setNotes(prev); throw new Error("Offline — cannot delete notes"); }
  }, [notes]);

  const toggle = useCallback(async (id: string) => {
    try {
      const updated = await apiToggle(id);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
      return updated;
    } catch { throw new Error("Offline — cannot toggle pin"); }
  }, []);

  return {
    notes, subjects, loading, error, searchQuery, filterSubject,
    refresh, doSearch, create, update, remove, toggle,
  };
}
