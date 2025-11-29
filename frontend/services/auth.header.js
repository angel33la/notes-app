import AsyncStorage from '@react-native-async-storage/async-storage';

const storageGet = async (key) => {
    try {
        if (AsyncStorage && AsyncStorage.getItem) {
            const v = await AsyncStorage.getItem(key);
            return v;
        }
    } catch (_) {}
    try {
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (_) {}
    return null;
};

const authHeader = async () => {
    try {
        const raw = await storageGet('user');
        if (!raw) return {};
        const user = JSON.parse(raw);
        const token = user && (user.token || user.accessToken || (user.data && user.data.token));
        if (token) return { Authorization: `Bearer ${token}` };
        return {};
    } catch (_) {
        return {};
    }
};

export default authHeader;