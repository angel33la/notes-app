import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/v1/auth`;

const storageSet = async (key, value) => {
    try {
        if (AsyncStorage && AsyncStorage.setItem) {
            await AsyncStorage.setItem(key, value);
            return;
        }
    } catch (_) {}
    try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch (_) {}
};

const storageGet = async (key) => {
    try {
        if (AsyncStorage && AsyncStorage.getItem) {
            return await AsyncStorage.getItem(key);
        }
    } catch (_) {}
    try {
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (_) {}
    return null;
};

const storageRemove = async (key) => {
    try {
        if (AsyncStorage && AsyncStorage.removeItem) {
            await AsyncStorage.removeItem(key);
            return;
        }
    } catch (_) {}
    try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch (_) {}
};

const signup = async (email, password) => {
    const response = await axios.post(`${API_URL}/`, { email, password });
    if (response.data && response.data.token) {
        await storageSet('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Alias
const register = signup;

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    if (response.data && response.data.token) {
        await storageSet('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = async () => {
    await storageRemove('user');
};

const getCurrentUser = async () => {
    const raw = await storageGet('user');
    return raw ? JSON.parse(raw) : null;
};

const requestPasswordReset = async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
};

const authService = {
    signup,
    register,
    login,
    logout,
    getCurrentUser,
    requestPasswordReset,
};

export default authService;