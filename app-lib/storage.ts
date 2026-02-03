import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, UserSettings, FoodItem } from '../app-types';

// Keys
const DAILY_LOGS_KEY = '@food_diary_logs';
const SETTINGS_KEY = '@food_diary_settings';
const FOOD_HISTORY_KEY = '@food_diary_history';

// Get today's date as ISO string (YYYY-MM-DD)
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Load all daily logs
export const loadLogs = async (): Promise<Record<string, DailyLog>> => {
  try {
    const data = await AsyncStorage.getItem(DAILY_LOGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading logs:', error);
    return {};
  }
};

// Save all daily logs
export const saveLogs = async (logs: Record<string, DailyLog>): Promise<void> => {
  try {
    await AsyncStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
};

// Load user settings
export const loadSettings = async (): Promise<UserSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // Default settings
  return {
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbsGoal: 250,
    dailyFatGoal: 65,
    weightUnit: 'kg',
  };
};

// Save user settings
export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Load food history (for quick lookup)
export const loadFoodHistory = async (): Promise<Record<string, FoodItem>> => {
  try {
    const data = await AsyncStorage.getItem(FOOD_HISTORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading food history:', error);
    return {};
  }
};

// Save food to history
export const saveFoodToHistory = async (food: FoodItem): Promise<void> => {
  try {
    const history = await loadFoodHistory();
    history[food.barcode] = food;
    await AsyncStorage.setItem(FOOD_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving food history:', error);
  }
};

// Add food to today's log
export const addFoodToDiary = async (
  food: Omit<FoodItem, 'consumedDate'>,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
): Promise<void> => {
  const logs = await loadLogs();
  const today = getTodayDate();
  
  if (!logs[today]) {
    logs[today] = { date: today, foods: [], waterGlasses: 0 };
  }
  
  const foodItem: FoodItem = {
    ...food,
    consumedDate: today,
    consumedMeal: mealType,
  };
  
  logs[today].foods.push(foodItem);
  await saveLogs(logs);
};

// Get today's log
export const getTodayLog = async (): Promise<DailyLog> => {
  const logs = await loadLogs();
  const today = getTodayDate();
  
  if (!logs[today]) {
    return { date: today, foods: [], waterGlasses: 0 };
  }
  
  return logs[today];
};

// Update water intake
export const addWater = async (glasses: number): Promise<void> => {
  const logs = await loadLogs();
  const today = getTodayDate();
  
  if (!logs[today]) {
    logs[today] = { date: today, foods: [], waterGlasses: 0 };
  }
  
  logs[today].waterGlasses += glasses;
  await saveLogs(logs);
};

// Update weight
export const updateWeight = async (weight: number): Promise<void> => {
  const logs = await loadLogs();
  const today = getTodayDate();
  
  if (!logs[today]) {
    logs[today] = { date: today, foods: [], waterGlasses: 0 };
  }
  
  logs[today].weight = weight;
  await saveLogs(logs);
};

// Get weekly logs for progress
export const getWeeklyLogs = async (): Promise<DailyLog[]> => {
  const logs = await loadLogs();
  const weeklyLogs: DailyLog[] = [];
  const today = getTodayDate();
  
  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (logs[dateStr]) {
      weeklyLogs.push(logs[dateStr]);
    }
  }
  
  return weeklyLogs;
};
