import AsyncStorage from '@react-native-async-storage/async-storage';

/** Chave atual (alinhada ao produto Nubank). */
export const STORAGE_KEY_LAST_SECONDS = '@nubank/lastSeconds';
export const STORAGE_KEY_AMOUNT = '@nubank/lastAmountText';
export const STORAGE_KEY_ACQUIRER = '@nubank/lastAcquirer';

const LEGACY_KEY = '@flashnotify/lastSeconds';

export async function loadLastSeconds(): Promise<number | null> {
  try {
    let raw = await AsyncStorage.getItem(STORAGE_KEY_LAST_SECONDS);
    if (raw === null) {
      raw = await AsyncStorage.getItem(LEGACY_KEY);
      if (raw !== null) {
        await AsyncStorage.setItem(STORAGE_KEY_LAST_SECONDS, raw);
        await AsyncStorage.removeItem(LEGACY_KEY);
      }
    }
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return null;
    return n;
  } catch {
    return null;
  }
}

export async function saveLastSeconds(seconds: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_LAST_SECONDS, String(seconds));
  try {
    await AsyncStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

export async function loadAmountText(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_AMOUNT);
  } catch {
    return null;
  }
}

export async function saveAmountText(text: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_AMOUNT, text);
}

export async function loadAcquirerName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_ACQUIRER);
  } catch {
    return null;
  }
}

export async function saveAcquirerName(text: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_ACQUIRER, text);
}
