import AsyncStorage from '@react-native-async-storage/async-storage';

export const TEST_CARD_STORAGE_KEY = '@notarizr/test-payment-card';
export const TEST_CARD_NUMBER = '4242424242424242';

const normalizeDigits = value => String(value || '').replace(/\D/g, '');

export const isTestCardNumber = value =>
  normalizeDigits(value) === TEST_CARD_NUMBER;

export const saveTestCard = () =>
  AsyncStorage.setItem(
    TEST_CARD_STORAGE_KEY,
    JSON.stringify({brand: 'Visa', isTest: true, last4: '4242'}),
  );

export const getSavedTestCard = async () => {
  try {
    const value = await AsyncStorage.getItem(TEST_CARD_STORAGE_KEY);
    const card = value ? JSON.parse(value) : null;
    return card?.isTest ? card : null;
  } catch (_) {
    return null;
  }
};

export const hasSavedTestCard = async () => Boolean(await getSavedTestCard());
