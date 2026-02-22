// Session ID utility for anonymous tracking
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'lottery_educator_session_id';

export const getOrCreateSessionId = async (): Promise<string> => {
  try {
    let sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('Error managing session ID:', error);
    return uuidv4();
  }
};

export const clearSessionId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error clearing session ID:', error);
  }
};
