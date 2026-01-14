// lib/api.ts
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'http://10.1.14.15:5234',
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
            // Token expired, logout user
            console.log('Token expired, logging out...');
            // Optional: trigger logout
        }
        return Promise.reject(error);
    }
);

export { api };