export const SEARCH_CATEGORIES = [
  { key: "Classes", icon: "school", color: "#5C6BC0", screen: "Calendar" },
  { key: "Tasks", icon: "checkbox", color: "#FFA726", screen: "Tasks" },
  { key: "Assignments", icon: "document-text", color: "#FF7043", screen: "Assignments" },
  { key: "Exams", icon: "calendar", color: "#EF5350", screen: "Exams" },
  { key: "Notes", icon: "document-text", color: "#26A69A", screen: "Notes" },
  { key: "Timetable", icon: "repeat", color: "#42A5F5", screen: "Timetable" },
  { key: "Calendar Events", icon: "calendar-outline", color: "#AB47BC", screen: "Calendar" },
];

export const SCREEN_SHORTCUTS = [
  { key: "Calendar", icon: "calendar", color: "#5C6BC0", screen: "Calendar" },
  { key: "Attendance", icon: "stats-chart", color: "#5C6BC0", screen: "Attendance" },
  { key: "Statistics", icon: "bar-chart", color: "#26A69A", screen: "Statistics" },
  { key: "Rewards", icon: "trophy", color: "#FFA726", screen: "Rewards" },
  { key: "Profile", icon: "person", color: "#42A5F5", screen: "Profile" },
  { key: "Settings", icon: "settings", color: "#78909C", screen: "Settings" },
  { key: "Backup", icon: "cloud-upload", color: "#66BB6A", screen: "Backup" },
];

export const EMPTY_ACTIONS = [
  { label: "Ask AI", icon: "sparkles", screen: "Home", params: { focusAI: true } },
  { label: "Create Class", icon: "add-circle", screen: "AddEvent" },
  { label: "Create Task", icon: "checkbox", screen: "AddTask" },
];

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  type: string;
  color: string;
  screen: string;
  params?: any;
  _searchable?: string;
}

export interface SearchCategory {
  category: string;
  items: SearchItem[];
}
