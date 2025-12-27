// app/lib/api.ts
import axios from "axios";
import { getApiBaseUrl } from "./apiBase";

// **INI SYNC!**
const baseURL = getApiBaseUrl();
console.log("[api] baseURL =", baseURL);

export const api = axios.create({
    baseURL,
    timeout: 10000,
});