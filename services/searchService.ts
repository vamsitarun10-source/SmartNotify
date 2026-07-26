import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEARCH_CATEGORIES, SCREEN_SHORTCUTS, type SearchItem, type SearchCategory } from "../constants/search";
import type { ClassEvent } from "./events";
import type { Task } from "./tasks";
import type { Assignment } from "./assignments";
import type { Exam } from "./exams";
import type { Note } from "./notes";
import type { TimetableEntry } from "./timetable";
import type { CalendarEvent } from "./calendar";

const RECENT_KEY = "@search_recent";
const MAX_RECENT = 10;

interface SearchableData {
  events: ClassEvent[];
  tasks: Task[];
  assignments: Assignment[];
  exams: Exam[];
  notes: Note[];
  timetable: TimetableEntry[];
  calendarEvents: CalendarEvent[];
}

function matchScore(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower === q) return 100;
  if (lower.startsWith(q)) return 80;
  if (lower.includes(q)) return 60;
  if (q.length >= 3 && lower.includes(q.slice(0, 3))) return 40;
  return 0;
}

export function buildSearchIndex(data: SearchableData): SearchItem[] {
  const items: SearchItem[] = [];

  for (const e of data.events) {
    const searchable = [e.title, e.subject, e.location, e.notes].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "event_" + (e.id || e.title),
      title: e.title,
      subtitle: `${e.date} at ${e.time}` + (e.location ? ` — ${e.location}` : ""),
      category: "Classes",
      type: "event",
      color: "#5C6BC0",
      screen: "Calendar",
      params: { selectedDate: e.date, eventId: e.id },
      _searchable: searchable,
    });
  }

  for (const t of data.tasks) {
    const searchable = [t.title, t.category, t.notes].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "task_" + (t.id || t.title),
      title: t.title,
      subtitle: (t.due_date ? `${t.due_date} ${t.due_time || ""}` : "") + (t.category ? ` — ${t.category}` : ""),
      category: "Tasks",
      type: "task",
      color: "#FFA726",
      screen: "Tasks",
      _searchable: searchable,
    });
  }

  for (const a of data.assignments) {
    const searchable = [a.title, a.subject, a.notes, a.attachment].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "assignment_" + (a.id || a.title),
      title: a.title,
      subtitle: (a.due_date ? `${a.due_date} ${a.due_time || ""}` : "") + (a.subject ? ` — ${a.subject}` : ""),
      category: "Assignments",
      type: "assignment",
      color: "#FF7043",
      screen: "Assignments",
      _searchable: searchable,
    });
  }

  for (const e of data.exams) {
    const searchable = [e.title, e.subject, e.exam_type, e.location, e.notes].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "exam_" + (e.id || e.title),
      title: e.title,
      subtitle: `${e.date} at ${e.time}` + (e.exam_type ? ` — ${e.exam_type}` : "") + (e.location ? ` in ${e.location}` : ""),
      category: "Exams",
      type: "exam",
      color: "#EF5350",
      screen: "Exams",
      _searchable: searchable,
    });
  }

  for (const n of data.notes) {
    const content = n.content || "";
    const searchable = [n.title, content, n.subject].filter(Boolean).join(" ").toLowerCase();
    const preview = content.length > 60 ? content.slice(0, 60) + "..." : content;
    items.push({
      id: "note_" + (n.id || n.title),
      title: n.title,
      subtitle: preview + (n.subject ? ` — ${n.subject}` : ""),
      category: "Notes",
      type: "note",
      color: "#26A69A",
      screen: "Notes",
      _searchable: searchable,
    });
  }

  for (const t of data.timetable) {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const searchable = [t.title, t.subject, t.location, t.notes].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "tt_" + (t.id || t.title),
      title: t.title,
      subtitle: `${dayNames[t.day_of_week] || "?"} at ${t.time}` + (t.location ? ` — ${t.location}` : ""),
      category: "Timetable",
      type: "timetable",
      color: "#42A5F5",
      screen: "Timetable",
      _searchable: searchable,
    });
  }

  for (const c of data.calendarEvents) {
    const searchable = [c.title, c.category, c.notes].filter(Boolean).join(" ").toLowerCase();
    items.push({
      id: "cal_" + (c.id || c.title),
      title: c.title,
      subtitle: c.date + (c.category ? ` — ${c.category}` : "") + (c.notes ? ` (${c.notes.slice(0, 40)})` : ""),
      category: "Calendar Events",
      type: "calendar",
      color: "#AB47BC",
      screen: "Calendar",
      params: { selectedDate: c.date },
      _searchable: searchable,
    });
  }

  return items;
}

export function searchIndex(items: SearchItem[], query: string): SearchCategory[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const withScores = items
    .map((item) => ({ item, score: matchScore(item._searchable || item.title.toLowerCase(), q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const shortcuts: SearchCategory = {
    category: "Screens",
    items: [],
  };

  for (const shortcut of SCREEN_SHORTCUTS) {
    if (shortcut.key.toLowerCase().includes(q) || q.includes(shortcut.key.toLowerCase().slice(0, 3))) {
      shortcuts.items.push({
        id: "screen_" + shortcut.key,
        title: shortcut.key,
        subtitle: `Open ${shortcut.key}`,
        category: "Screens",
        type: "screen",
        color: shortcut.color,
        screen: shortcut.screen,
      });
    }
  }

  const resultMap: Record<string, SearchItem[]> = {};
  for (const { item } of withScores) {
    if (!resultMap[item.category]) resultMap[item.category] = [];
    resultMap[item.category].push(item);
  }

  const results: SearchCategory[] = [];

  if (shortcuts.items.length > 0) {
    results.push(shortcuts);
  }

  for (const cat of SEARCH_CATEGORIES) {
    if (resultMap[cat.key]) {
      results.push({ category: cat.key, items: resultMap[cat.key] });
    }
  }

  return results;
}

export function highlightMatch(text: string, query: string): { before: string; match: string; after: string } {
  if (!query) return { before: text, match: "", after: "" };
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return { before: text, match: "", after: "" };
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + q.length),
    after: text.slice(idx + q.length),
  };
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<void> {
  try {
    const recent = await getRecentSearches();
    const filtered = recent.filter((r) => r !== query);
    filtered.unshift(query);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_KEY);
  } catch {}
}
