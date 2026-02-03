import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { getTodayLog, loadSettings } from '../app-lib/storage';
import { DailyLog, UserSettings } from '../app-types';
import { getTodayDate } from '../app-lib/storage';

const HomeScreen = () => {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const log = await getTodayLog();
    const userSettings = await loadSettings();
    setTodayLog(log);
    setSettings(userSettings);
  };

  const calculateTotals = () => {
    if (!todayLog) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    todayLog.foods.forEach(food => {
      totals.calories += food.calories * food.servings;
      totals.protein += food.protein * food.servings;
      totals.carbs += food.carbs * food.servings;
      totals.fat += food.fat * food.servings;
    });

    return totals;
  };

  const totals = calculateTotals();
  const remaining = settings ? {
    calories: settings.dailyCalorieGoal - totals.calories,
    protein: settings.dailyProteinGoal - totals.protein,
    carbs: settings.dailyCarbsGoal - totals.carbs,
    fat: settings.dailyFatGoal - totals.fat,
  } : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Diary</Text>
        <Text style={styles.headerDate}>{getTodayDate()}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Calorie Budget Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Budget</Text>
          {remaining && (
            <View style={styles.calorieRow}>
              <View style={styles.calorieMain}>
                <Text style={styles.calorieBig}>
                  {remaining.calories > 0 ? remaining.calories : 0}
                </Text>
                <Text style={styles.calorieLabel}>calories left</Text>
              </View>
              <View style={styles.calorieStats}>
                <View style={styles.statRow}>
                  <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.statText}>
                    {totals.protein}g / {settings?.dailyProteinGoal}g protein
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <View style={[styles.statDot, { backgroundColor: '#2196F3' }]} />
                  <Text style={styles.statText}>
                    {totals.carbs}g / {settings?.dailyCarbsGoal}g carbs
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <View style={[styles.statDot, { backgroundColor: '#FF9800' }]} />
                  <Text style={styles.statText}>
                    {totals.fat}g / {settings?.dailyFatGoal}g fat
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Add Section */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickAddGrid}>
          <TouchableOpacity style={styles.quickAddButton}>
            <Text style={styles.quickAddIcon}>📷</Text>
            <Text style={styles.quickAddText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAddButton}>
            <Text style={styles.quickAddIcon}>🔍</Text>
            <Text style={styles.quickAddText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAddButton}>
            <Text style={styles.quickAddIcon}>💧</Text>
            <Text style={styles.quickAddText}>Water</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAddButton}>
            <Text style={styles.quickAddIcon}>⚖️</Text>
            <Text style={styles.quickAddText}>Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Meals Summary */}
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <View style={styles.mealsCard}>
          {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => {
            const mealFoods = todayLog?.foods.filter(f => f.consumedMeal === meal) || [];
            const mealCalories = mealFoods.reduce((sum, f) => sum + f.calories * f.servings, 0);
            
            return (
              <View key={meal} style={styles.mealRow}>
                <Text style={styles.mealName}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
                <Text style={styles.mealCalories}>
                  {mealCalories} cal
                </Text>
              </View>
            );
          })}
        </View>

        {/* Water Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Water Intake</Text>
          <View style={styles.waterRow}>
            <Text style={styles.waterBig}>{todayLog?.waterGlasses || 0}</Text>
            <Text style={styles.waterLabel}>glasses today</Text>
          </View>
          <View style={styles.waterIcons}>
            {[...Array(Math.min((todayLog?.waterGlasses || 0), 8))].map((_, i) => (
              <Text key={i} style={styles.waterIcon}>💧</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  headerDate: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  calorieRow: { flexDirection: 'row', alignItems: 'center' },
  calorieMain: { flex: 1, alignItems: 'center' },
  calorieBig: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50' },
  calorieLabel: { fontSize: 14, color: '#666' },
  calorieStats: { flex: 1 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statText: { fontSize: 13, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333', marginTop: 8 },
  quickAddGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  quickAddButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAddIcon: { fontSize: 24, marginBottom: 4 },
  quickAddText: { fontSize: 14, fontWeight: '500', color: '#333' },
  mealsCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  mealName: { fontSize: 16, color: '#333' },
  mealCalories: { fontSize: 16, fontWeight: '500', color: '#666' },
  waterRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  waterBig: { fontSize: 36, fontWeight: 'bold', color: '#2196F3' },
  waterLabel: { fontSize: 14, color: '#666', marginLeft: 8 },
  waterIcons: { flexDirection: 'row', flexWrap: 'wrap' },
  waterIcon: { fontSize: 20, marginRight: 4 },
});

export default HomeScreen;
