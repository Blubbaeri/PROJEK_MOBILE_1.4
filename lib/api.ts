// lib/api.ts
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from './apiBase'; // 1. Tambahkan import ini

const api = axios.create({
    baseURL: getApiBaseUrl(), // 2. Ganti URL manual jadi manggil fungsi Bos Besar
    timeout: 10000,
});

// Interceptor untuk otomatis tambah token dari AsyncStorage
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('user-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor untuk handle 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('Token expired, logging out...');
        }
        return Promise.reject(error);
    }
);

export { api };