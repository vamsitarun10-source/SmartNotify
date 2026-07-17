import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_BACKUP_KEY = "last_backup_time";

export async function exportBackup(): Promise<{ blob: Blob; filename: string }> {
  const response = await api.get("/backup/export", { responseType: "blob" });
  const contentDisposition = response.headers["content-disposition"] || "";
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : `classreminder_backup.json`;

  const blob = new Blob([response.data], { type: "application/json" });
  return { blob, filename };
}

export async function importBackup(backupData: object, replace: boolean = false): Promise<{ imported: number; message: string }> {
  const { data } = await api.post("/backup/import", { backup: backupData, replace });
  return data;
}

export async function setLastBackupTime() {
  await AsyncStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

export async function getLastBackupTime(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_BACKUP_KEY);
}
