import { useState, useCallback } from "react";
import { exportBackup as apiExport, importBackup as apiImport, setLastBackupTime, getLastBackupTime } from "../services/backup";

export function useBackup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; message: string } | null>(null);

  const loadLastBackupTime = useCallback(async () => {
    const time = await getLastBackupTime();
    setLastBackup(time);
  }, []);

  const exportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiExport();
      await setLastBackupTime();
      setLastBackup(new Date().toISOString());
      return result;
    } catch (e: any) {
      setError(e?.message || "Export failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (backupData: object, replace: boolean = false) => {
    setLoading(true);
    setError(null);
    setImportResult(null);
    try {
      const result = await apiImport(backupData, replace);
      setImportResult(result);
      return result;
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Import failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, lastBackup, importResult, loadLastBackupTime, exportData, importData };
}
