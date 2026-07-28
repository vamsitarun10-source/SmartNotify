// In-memory debug log buffer.
// Every [NOTIF] call from notifications.ts is captured here
// so the DebugConsole screen can display it without ADB.

type LogEntry = {
  timestamp: string;
  message: string;
};

const MAX_ENTRIES = 200;

class DebugLogger {
  private static _instance: DebugLogger;
  private _logs: LogEntry[] = [];
  private _listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger._instance) {
      DebugLogger._instance = new DebugLogger();
    }
    return DebugLogger._instance;
  }

  log(message: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
    };
    this._logs.push(entry);
    if (this._logs.length > MAX_ENTRIES) {
      this._logs.shift();
    }
    // Notify UI listeners
    this._listeners.forEach((cb) => cb());
  }

  getLogs(): LogEntry[] {
    return this._logs;
  }

  getLogText(): string {
    return this._logs.map((e) => `[${e.timestamp}] ${e.message}`).join("\n");
  }

  clear(): void {
    this._logs = [];
    this._listeners.forEach((cb) => cb());
  }

  subscribe(cb: () => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }
}

export const debugLogger = DebugLogger.getInstance();
