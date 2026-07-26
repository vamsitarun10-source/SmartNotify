import { AppState, AppStateStatus } from "react-native";

const HEARTBEAT_URL = "https://smartnotify-backend.onrender.com/health";
const INTERVAL_MS = 300000;
const FETCH_TIMEOUT_MS = 10000;

type Listener = (status: "active" | "background") => void;

class HeartbeatService {
  private static _instance: HeartbeatService;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private _isRunning = false;
  private _isInBackground = false;
  private readonly _devMode = __DEV__;

  private constructor() {}

  static getInstance(): HeartbeatService {
    if (!HeartbeatService._instance) {
      HeartbeatService._instance = new HeartbeatService();
    }
    return HeartbeatService._instance;
  }

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this._isInBackground = false;

    this._sendHeartbeat();
    this._timer = setInterval(() => this._sendHeartbeat(), INTERVAL_MS);
    this._listenToAppState();
  }

  stop(): void {
    this._isRunning = false;
    this._isInBackground = false;

    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }

    if (this._appStateSubscription) {
      this._appStateSubscription.remove();
      this._appStateSubscription = null;
    }
  }

  private _sendHeartbeat(): void {
    if (this._isInBackground) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    fetch(HEARTBEAT_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (this._devMode) {
          console.log("Heartbeat success");
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        if (this._devMode) {
          console.log("Heartbeat failed");
        }
      });
  }

  private _listenToAppState(): void {
    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        this._isInBackground = false;
        this._sendHeartbeat();
      } else if (nextState.match(/inactive|background/)) {
        this._isInBackground = true;
      }
    };

    this._appStateSubscription = AppState.addEventListener("change", handleChange);
  }
}

export default HeartbeatService;
