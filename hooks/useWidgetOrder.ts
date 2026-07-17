import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WIDGET_ORDER_KEY = "dashboard_widget_order";

const DEFAULT_ORDER = [
  "welcome", "nextClass", "quickActions", "rewards", "attendance", "productivity",
  "aiSuggestions", "exams", "assignments", "freeTime", "studyHours",
  "recentNotes", "attendanceCheck",
];

export function useWidgetOrder() {
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WIDGET_ORDER_KEY).then((raw) => {
      if (raw) {
        try {
          const stored = JSON.parse(raw);
          const merged = [...stored, ...DEFAULT_ORDER.filter((d) => !stored.includes(d))];
          setOrder(merged);
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const moveUp = useCallback((index: number) => {
    setOrder((prev) => {
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      AsyncStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setOrder((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      AsyncStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { order, loaded, moveUp, moveDown };
}
