// app/lib/apiBase.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Cari IP yang digunakan Expo/Metro (debuggerHost / hostUri) dan
 * return base URL: http://<ip>:5234
 *
 * Jika tidak ketemu, fallback ke localhost/emulator defaults.
 */
export function getApiBaseUrl(): string {
    // 1) Try modern Expo fields first
    const expoHost =
        // Expo dev client / newer expo
        // @ts-ignore
        Constants.expoConfig?.hostUri ||
        // older / other fields fallback
        // @ts-ignore
        Constants.expoGoConfig?.hostUri ||
        // legacy manifest
        // @ts-ignore
        Constants.manifest?.debuggerHost ||
        // expo web / other
        // @ts-ignore
        Constants.debuggerHost;

    if (expoHost) {
        const hostOnly = String(expoHost).split(":")[0];
        // Android emulator special case when host is 'localhost'
        if (Platform.OS === "android" && (hostOnly === "localhost" || hostOnly === "127.0.0.1")) {
            // Android emulator -> maps to host machine via 10.0.2.2
            return "http://10.0.2.2:5234";
        }
        return `http://${hostOnly}:5234`;
    }

    // No expo info available (e.g. building web or unusual env)
    // Fallbacks:
    if (Platform.OS === "android") return "http://10.0.2.2:5234"; // emulator
    if (Platform.OS === "ios") return "http://localhost:5234"; // simulator maps to host
    // default fallback (for web/dev)
    return "http://localhost:5234";
}
