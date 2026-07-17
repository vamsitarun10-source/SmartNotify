import { useState, useCallback, useRef } from "react";
import { globalSearch, type SearchCategory } from "../services/search";

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await globalSearch(q.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const totalResults = results.reduce((sum, cat) => sum + cat.items.length, 0);

  return { results, loading, query, totalResults, search, clear };
}
