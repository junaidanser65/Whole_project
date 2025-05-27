import AsyncStorage from '@react-native-async-storage/async-storage';

export const OfflineStorage = {
  async cacheData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  },

  async getCachedData(key, maxAge = 3600000) { // 1 hour default
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  },

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}; 