import { useState, useCallback, useRef, useEffect } from "react";
import type { SearchItem, SearchCategory } from "../constants/search";
import {
  buildSearchIndex,
  searchIndex,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches as clearRecent,
} from "../services/searchService";
import { useEvents } from "./useEvents";
import { useTasks } from "./useTasks";
import { useAssignments } from "./useAssignments";
import { useExams } from "./useExams";
import { useNotes } from "./useNotes";
import { useTimetable } from "./useTimetable";
import { useCalendarEvents } from "./useCalendar";

export function useGlobalSearch() {
  const { events, refresh: refreshEvents } = useEvents();
  const { tasks, refresh: refreshTasks } = useTasks();
  const { assignments, refresh: refreshAssignments } = useAssignments();
  const { exams, refresh: refreshExams } = useExams();
  const { notes, refresh: refreshNotes } = useNotes();
  const { entries: timetable, refresh: refreshTimetable } = useTimetable();
  const { events: calendarEvents, refresh: refreshCalendar } = useCalendarEvents();

  const [index, setIndex] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Rebuild index whenever any data source changes
  useEffect(() => {
    const idx = buildSearchIndex({ events, tasks, assignments, exams, notes, timetable, calendarEvents });
    setIndex(idx);
  }, [events, tasks, assignments, exams, notes, timetable, calendarEvents]);

  // Re-run search whenever the index changes and there's an active query
  useEffect(() => {
    if (query.trim() && index.length > 0) {
      const found = searchIndex(index, query.trim());
      setResults(found);
    }
  }, [index, query]);

  // Load recent searches on mount
  useEffect(() => {
    getRecentSearches().then(setRecent);
  }, []);

  // Refresh all data sources
  const refreshData = useCallback(() => {
    refreshEvents();
    refreshTasks();
    refreshAssignments();
    refreshExams();
    refreshNotes();
    refreshTimetable();
    refreshCalendar();
  }, []);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      const found = searchIndex(index, q.trim());
      setResults(found);
      setLoading(false);
    }, 200);
  }, [index]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const saveRecent = useCallback(async (q: string) => {
    await addRecentSearch(q);
    const updated = await getRecentSearches();
    setRecent(updated);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearRecent();
    setRecent([]);
  }, []);

  const totalResults = results.reduce((sum, cat) => sum + cat.items.length, 0);

  return { results, loading, query, totalResults, recent, search, clear, saveRecent, clearHistory, refreshData };
}
