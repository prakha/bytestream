import axios from 'axios';
import { AUTH_URL, UPLOAD_URL, WATCH_URL } from './BaseUrl';

export const axiosInterceptor = (baseURL: string, apiKey?: string) => {
    const api = axios.create({
        baseURL
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            if (apiKey) {
                config.headers['x-api-key'] = apiKey;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return api;
};

export const authApi = axiosInterceptor(AUTH_URL);
export const uploadApi = axiosInterceptor(UPLOAD_URL);
export const watchApi = axiosInterceptor(WATCH_URL);