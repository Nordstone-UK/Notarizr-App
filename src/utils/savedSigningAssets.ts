import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedStamp = {
  id: string;
  name: string;
  url: string;
};

const stampStorageKey = (userId?: string) =>
  `@notarizr/saved-stamps:${userId || 'unknown-agent'}`;

export const getSavedStamps = async (userId?: string): Promise<SavedStamp[]> => {
  try {
    const value = await AsyncStorage.getItem(stampStorageKey(userId));
    if (!value) {
      return [];
    }
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, 2) : [];
  } catch (error) {
    console.warn('Unable to load saved stamps:', error);
    return [];
  }
};

export const saveSavedStamps = async (
  userId: string | undefined,
  stamps: SavedStamp[],
) => {
  const limitedStamps = stamps.slice(0, 2);
  await AsyncStorage.setItem(
    stampStorageKey(userId),
    JSON.stringify(limitedStamps),
  );
  return limitedStamps;
};

