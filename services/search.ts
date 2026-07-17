import api from "./api";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  color: string;
}

export interface SearchCategory {
  category: string;
  items: SearchResultItem[];
}

export async function globalSearch(query: string): Promise<SearchCategory[]> {
  const { data } = await api.get<SearchCategory[]>("/search/", { params: { q: query } });
  return data;
}
