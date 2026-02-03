import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { getTodayLog, loadSettings, removeFoodFromDiary } from '../app-lib/storage';
import { DailyLog, FoodItem, UserSettings } from '../app-types';

const DiaryScreen = () => {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editingFood, setEditingFood] = useState<string | null>(null);
  const [editServings, setEditServings] = useState('1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const log = await getTodayLog();
    const userSettings = await loadSettings();
    setTodayLog(log);
    setSettings(userSettings);
  };

  const handleRemoveFood = async (foodId: string) => {
    const logs = await loadLogs();
    const today = getTodayDate();
    if (logs[today]) {
      logs[today].foods = logs[today].foods.filter((f, i) => i.toString() !== foodId);
      await saveLogs(logs);
      await loadData();
    }
  };

  const getMealTotals = (meal: string) => {
    const mealFoods = todayLog?.foods.filter(f => f.consumedMeal === meal) || [];
    return mealFoods.reduce((sum, f) => ({
      calories: sum.calories + f.calories * f.servings,
      protein: sum.protein + f.protein * f.servings,
      carbs: sum.carbs + f.carbs * f.servings,
      fat: sum.fat + f.fat * f.servings,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const renderMealSection = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const mealFoods = todayLog?.foods.filter(f => f.consumedMeal === meal) || [];
    const totals = getMealTotals(meal);
    const mealTitle = meal.charAt(0).toUpperCase() + meal.slice(1);

    return (
      <View key={meal} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.mealTitle}>{mealTitle}</Text>
            <Text style={styles.mealCalories}>{totals.calories} calories</Text>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.macroText}>P: {totals.protein}g</Text>
            <Text style={styles.macroText}>C: {totals.carbs}g</Text>
            <Text style={styles.macroText}>F: {totals.fat}g</Text>
          </View>
        </View>

        {mealFoods.length === 0 ? (
          <Text style={styles.emptyMeal}>No entries yet</Text>
        ) : (
          mealFoods.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodServings}>{food.servings} × {food.servingSize}</Text>
                <Text style={styles.foodCalories}>{Math.round(food.calories * food.servings)} cal</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleRemoveFood(index.toString())}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Food Diary</Text>
        <Text style={styles.headerDate}>{getTodayDate()}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily Summary */}
        {settings && todayLog && (() => {
          const totals = todayLog.foods.reduce((sum, f) => ({
            calories: sum.calories + f.calories * f.servings,
            protein: sum.protein + f.protein * f.servings,
            carbs: sum.carbs + f.carbs * f.servings,
            fat: sum.fat + f.fat * f.servings,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

          return (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Today's Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, totals.calories > settings.dailyCalorieGoal ? styles.overLimit : null]}>
                    {totals.calories}
                  </Text>
                  <Text style={styles.summaryLabel}>/ {settings.dailyCalorieGoal} cal</Text>
                </View>
                <View style={styles.summaryMacros}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{totals.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{totals.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{totals.fat}g</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Meals */}
        {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => renderMealSection(meal))}
        
        {/* Water Section */}
        <View style={styles.waterSection}>
          <Text style={styles.sectionTitle}>💧 Water</Text>
          <View style={styles.waterRow}>
            <Text style={styles.waterCount}>{todayLog?.waterGlasses || 0} glasses</Text>
            <View style={styles.waterButtons}>
              <TouchableOpacity style={styles.waterButton} onPress={() => addWater(-1)}>
                <Text style={styles.waterButtonText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.waterButton} onPress={() => addWater(1)}>
                <Text style={styles.waterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Weight Section */}
        {todayLog?.weight && (
          <View style={styles.weightSection}>
            <Text style={styles.sectionTitle}>⚖️ Weight</Text>
            <Text style={styles.weightValue}>{todayLog.weight} kg</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Helper functions (would be imported in real app)
const getTodayDate = () => new Date().toISOString().split('T')[0];
const loadLogs = async () => {
  try {
    const data = await AsyncStorage.getItem('@food_diary_logs');
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};
const saveLogs = async (logs: Record<string, DailyLog>) => {
  try {
    await AsyncStorage.setItem('@food_diary_logs', JSON.stringify(logs));
  } catch {}
};
const addWater = async (glasses: number) => {
  const logs = await loadLogs();
  const today = getTodayDate();
  if (!logs[today]) logs[today] = { date: today, foods: [], waterGlasses: 0 };
  logs[today].waterGlasses = Math.max(0, (logs[today].waterGlasses || 0) + glasses);
  await saveLogs(logs);
  // Trigger reload - in real app would use state management
};

import { AsyncStorage } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerDate: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  summaryCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flexDirection: 'row', alignItems: 'baseline', marginRight: 20 },
  summaryValue: { fontSize: 36, fontWeight: 'bold', color: '#4CAF50' },
  overLimit: { color: '#f44336' },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryMacros: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  macroLabel: { fontSize: 11, color: '#999' },
  mealSection: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  mealCalories: { fontSize: 14, color: '#666' },
  mealMacros: { flexDirection: 'row' },
  macroText: { fontSize: 12, color: '#999', marginLeft: 8 },
  emptyMeal: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  foodItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 15, color: '#333' },
  foodServings: { fontSize: 12, color: '#999' },
  foodCalories: { fontSize: 13, color: '#4CAF50', marginTop: 2 },
  deleteButton: { padding: 8 },
  deleteButtonText: { fontSize: 20, color: '#f44336' },
  waterSection: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  waterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterCount: { fontSize: 18, fontWeight: '500', color: '#333' },
  waterButtons: { flexDirection: 'row' },
  waterButton: { backgroundColor: '#E3F2FD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  waterButtonText: { fontSize: 18, color: '#2196F3', fontWeight: '600' },
  weightSection: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 },
  weightValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
});

export default DiaryScreen;
