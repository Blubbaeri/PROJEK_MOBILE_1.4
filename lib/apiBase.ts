//lib/apiBase.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getApiBaseUrl(): string {
    const PORT = 5234;

    // **EDIT IP DI SINI SAJA!**
    //const ACTIVE_IP = '10.1.6.125';
    // const ACTIVE_IP = '192.168.100.3';
    // const ACTIVE_IP = '192.168.1.73';
    //const ACTIVE_IP = '10.1.13.5';
    //const ACTIVE_IP = '10.1.13.175';

    // const ACTIVE_IP = '172.20.10.3';
    //const ACTIVE_IP = '192.168.100.5';
    //const ACTIVE_IP = '192.168.207.1'; 
    //const ACTIVE_IP = '172.31.16.1';
    //const ACTIVE_IP = '10.209.114.95';
    // const ACTIVE_IP = '10.1.14.15';
    // const ACTIVE_IP = '192.168.1.38';
    // const ACTIVE_IP = '192.168.100.6';
    // const ACTIVE_IP = '192.168.1.10';
    // const ACTIVE_IP = '172.20.10.2';
    // const ACTIVE_IP = '172.30.241.95';
    const ACTIVE_IP = '192.168.100.4';



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

            // NOTE: Di mode development (Expo Go), expoHost akan otomatis mengambil IP laptop kamu.
            // Jika ingin memaksa pakai ACTIVE_IP di atas, komentari blok `if (__DEV__)` ini.

            if (Platform.OS === "android" && (hostOnly === "localhost" || hostOnly === "127.0.0.1")) {
                return `http://10.0.2.2:${PORT}`;
            }
            return `http://${hostOnly}:${PORT}`;
        }
    }

    // Fallback ke IP aktif (device fisik)
    return `http://${ACTIVE_IP}:${PORT}`;
}

export function getFileUrl(fileName: string | null): string {
    if (!fileName) return '';
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/files/alat/${fileName}`;
}