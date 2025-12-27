// app/lib/apiBase.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiBaseUrl(): string {
    const PORT = 5234;

    // **EDIT IP DI SINI SAJA!**
    //const ACTIVE_IP = '10.1.6.125'; // <-- GANTI DI SINI KALO GANTI WiFi
    const ACTIVE_IP = '192.168.100.3'; // <-- GANTI DI SINI KALO GANTI WiFi

    // Untuk development mode (emulator)
    if (__DEV__) {
        const expoHost =
            // @ts-ignore
            Constants.expoConfig?.hostUri ||
            // @ts-ignore
            Constants.manifest?.debuggerHost ||
            // @ts-ignore
            Constants.debuggerHost;

        if (expoHost) {
            const hostOnly = String(expoHost).split(":")[0];
            if (Platform.OS === "android" && (hostOnly === "localhost" || hostOnly === "127.0.0.1")) {
                return `http://10.0.2.2:${PORT}`;
            }
            return `http://${hostOnly}:${PORT}`;
        }
    }

    // Fallback ke IP aktif (device fisik)
    return `http://${ACTIVE_IP}:${PORT}`;
}