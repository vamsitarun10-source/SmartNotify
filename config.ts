import { Platform } from "react-native";

const DEV_EMULATOR_URL = "http://10.0.2.2:8000";
const PROD_URL = "http://192.168.1.102:8000";

export const API_URL = __DEV__
  ? Platform.OS === "android"
    ? DEV_EMULATOR_URL
    : "http://localhost:8000"
  : PROD_URL;
