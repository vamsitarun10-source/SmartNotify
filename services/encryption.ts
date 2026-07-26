import AsyncStorage from "@react-native-async-storage/async-storage";

const ENCRYPTION_KEY = "classreminder_enc_key_v1";

// Simple base64 obfuscation for local storage (not military-grade, but prevents casual reading)
function encode(data: string): string {
  try {
    return btoa(encodeURIComponent(data));
  } catch { return data; }
}

function decode(data: string): string {
  try {
    return decodeURIComponent(atob(data));
  } catch { return data; }
}

async function getEncryptionKey(): Promise<string> {
  let key = await AsyncStorage.getItem(ENCRYPTION_KEY);
  if (!key) {
    key = Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
    await AsyncStorage.setItem(ENCRYPTION_KEY, key);
  }
  return key;
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  const encKey = await getEncryptionKey();
  const combined = value + "::" + encKey;
  await AsyncStorage.setItem(`enc_${key}`, encode(combined));
}

export async function secureGetItem(key: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(`enc_${key}`);
    if (!raw) return null;
    const dec = decode(raw);
    const encKey = await getEncryptionKey();
    const parts = dec.split("::");
    if (parts.length === 2 && parts[1] === encKey) {
      return parts[0];
    }
    // Corrupted or wrong key — clear and return null
    await AsyncStorage.removeItem(`enc_${key}`);
    return null;
  } catch {
    // Corrupted data — gracefully clear
    await AsyncStorage.removeItem(`enc_${key}`);
    return null;
  }
}

export async function secureRemoveItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(`enc_${key}`);
}
