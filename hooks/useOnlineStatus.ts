import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then((state) => setIsOnline(state.isConnected ?? true));
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsub;
  }, []);

  return isOnline;
}
