import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { getWeeklyLogs, updateWeight, loadSettings } from '../app-lib/storage';
import { DailyLog, UserSettings } from '../app-types';

const ProgressScreen = () => {
  const [weeklyLogs, setWeeklyLogs] = useState<DailyLog[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [selectedStat, setSelectedStat] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const logs = await getWeeklyLogs();
    const userSettings = await loadSettings();
    setWeeklyLogs(logs);
    setSettings(userSettings);
  };

  const handleAddWeight = async () => {
    if (newWeight && !isNaN(parseFloat(newWeight))) {
      await updateWeight(parseFloat(newWeight));
      setNewWeight('');
      setShowWeightInput(false);
      await loadData();
    }
  };

  const getStatData = () => {
    return weeklyLogs.map(log => {
      const totals = log.foods.reduce((sum, f) => ({
        calories: sum.calories + f.calories * f.servings,
        protein: sum.protein + f.protein * f.servings,
        carbs: sum.carbs + f.carbs * f.servings,
        fat: sum.fat + f.fat * f.servings,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const date = new Date(log.date);
      const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
      const dayNum = date.getDate();

      return {
        day: `${dayName} ${dayNum}`,
        ...totals,
        weight: log.weight,
        water: log.waterGlasses,
      };
    });
  };

  const data = getStatData();
  const maxValue = Math.max(...data.map(d => d[selectedStat]), settings?.dailyCalorieGoal || 2000);

  const renderChart = () => {
    const chartHeight = 150;
    const barWidth = 30;
    const spacing = (320 - (barWidth * data.length)) / (data.length + 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((item, index) => {
            const value = item[selectedStat];
            const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
            const goal = selectedStat === 'calories' ? settings?.dailyCalorieGoal :
                         selectedStat === 'protein' ? settings?.dailyProteinGoal :
                         selectedStat === 'carbs' ? settings?.dailyCarbsGoal : settings?.dailyFatGoal;
            const goalHeight = goal ? (goal / maxValue) * chartHeight : 0;

            return (
              <View key={index} style={[styles.barWrapper, { marginHorizontal: spacing / 2 }]}>
                <View style={styles.barContainer}>
                  {/* Goal line */}
                  {goal && goal > 0 && (
                    <View style={[styles.goalLine, { bottom: goalHeight }]} />
                  )}
                  {/* Bar */}
                  <View
                    style={[
                      styles.bar,
                      { height: barHeight, backgroundColor: getBarColor(selectedStat) },
                      value > (goal || 0) && styles.barOver
                    ]}
                  />
                  {/* Value label */}
                  <Text style={styles.barValue}>{Math.round(value)}</Text>
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getBarColor(selectedStat) }]} />
            <Text style={styles.legendText}>{selectedStat}</Text>
          </View>
          {settings && (
            <View style={styles.legendItem}>
              <View style={[styles.legendLine]} />
              <Text style={styles.legendText}>Goal: {selectedStat === 'calories' ? settings.dailyCalorieGoal :
                         selectedStat === 'protein' ? settings.dailyProteinGoal :
                         selectedStat === 'carbs' ? settings.dailyCarbsGoal : settings.dailyFatGoal}
                         {selectedStat !== 'calories' ? 'g' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getBarColor = (stat: string) => {
    switch (stat) {
      case 'calories': return '#4CAF50';
      case 'protein': return '#2196F3';
      case 'carbs': return '#FF9800';
      case 'fat': return '#f44336';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📈 Progress</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Stat Selector */}
        <View style={styles.statSelector}>
          {['calories', 'protein', 'carbs', 'fat'].map(stat => (
            <TouchableOpacity
              key={stat}
              style={[styles.statButton, selectedStat === stat && { backgroundColor: getBarColor(stat) }]}
              onPress={() => setSelectedStat(stat as any)}
            >
              <Text style={[styles.statButtonText, selectedStat === stat && { color: 'white' }]}>
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Last 7 Days</Text>
          {renderChart()}
        </View>

        {/* Weight Section */}
        <View style={styles.weightCard}>
          <Text style={styles.cardTitle}>⚖️ Weight Tracking</Text>
          
          {data.filter(d => d.weight).length > 0 ? (
            <View style={styles.weightChart}>
              {data.filter(d => d.weight).map((item, index) => (
                <View key={index} style={styles.weightItem}>
                  <Text style={styles.weightDate}>{item.day}</Text>
                  <Text style={styles.weightValue}>{item.weight} kg</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noWeight}>No weight logged yet</Text>
          )}

          {showWeightInput ? (
            <View style={styles.weightInputRow}>
              <TextInput
                style={styles.weightInput}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="Enter weight"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.saveWeightButton} onPress={handleAddWeight}>
                <Text style={styles.saveWeightButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelWeightButton} onPress={() => setShowWeightInput(false)}>
                <Text style={styles.cancelWeightButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addWeightButton} onPress={() => setShowWeightInput(true)}>
              <Text style={styles.addWeightButtonText}>+ Log Today's Weight</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Water Progress */}
        <View style={styles.waterCard}>
          <Text style={styles.cardTitle}>💧 Weekly Water Intake</Text>
          <View style={styles.waterChart}>
            {data.map((item, index) => (
              <View key={index} style={styles.waterItem}>
                <View style={styles.waterBottle}>
                  {[...Array(Math.min(item.water, 8))].map((_, i) => (
                    <View key={i} style={styles.waterFill} />
                  ))}
                </View>
                <Text style={styles.waterDay}>{item.day}</Text>
                <Text style={styles.waterCount}>{item.water} glasses</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Streak Info */}
        <View style={styles.streakCard}>
          <Text style={styles.cardTitle}>🏆 Streaks</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>0</Text>
              <Text style={styles.streakLabel}>Days Logged</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>0</Text>
              <Text style={styles.streakLabel}>Calories On Target</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 16 },
  statSelector: { flexDirection: 'row', marginBottom: 16 },
  statButton: { flex: 1, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginHorizontal: 4 },
  statButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  chartCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  chartContainer: { alignItems: 'center' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 170, paddingBottom: 20 },
  barWrapper: { alignItems: 'center' },
  barContainer: { alignItems: 'center', height: 150 },
  bar: { width: 30, borderRadius: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barOver: { borderWidth: 2, borderColor: '#f44336' },
  barValue: { fontSize: 10, color: '#666', marginTop: 4 },
  barLabel: { fontSize: 10, color: '#999', marginTop: 4 },
  goalLine: { position: 'absolute', width: 30, height: 2, backgroundColor: '#999', borderWidth: 1, borderColor: '#666' },
  legend: { flexDirection: 'row', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendLine: { width: 20, height: 2, backgroundColor: '#999', marginRight: 4 },
  legendText: { fontSize: 12, color: '#666' },
  weightCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  weightChart: { marginBottom: 16 },
  weightItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  weightDate: { fontSize: 14, color: '#666' },
  weightValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  noWeight: { fontSize: 14, color: '#999', fontStyle: 'italic', marginBottom: 16 },
  weightInputRow: { flexDirection: 'row', alignItems: 'center' },
  weightInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 8 },
  saveWeightButton: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  saveWeightButtonText: { color: 'white', fontWeight: '600' },
  cancelWeightButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  cancelWeightButtonText: { color: '#666' },
  addWeightButton: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, alignItems: 'center' },
  addWeightButtonText: { color: '#2196F3', fontWeight: '600' },
  waterCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  waterChart: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  waterItem: { alignItems: 'center', width: '23%', marginBottom: 12 },
  waterBottle: { width: 30, height: 60, borderWidth: 2, borderColor: '#2196F3', borderRadius: 4, padding: 2, justifyContent: 'flex-end' },
  waterFill: { backgroundColor: '#2196F3', height: 6, borderRadius: 1, marginBottom: 1 },
  waterDay: { fontSize: 10, color: '#999', marginTop: 4 },
  waterCount: { fontSize: 10, color: '#666' },
  streakCard: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-around' },
  streakItem: { alignItems: 'center' },
  streakValue: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  streakLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
});

export default ProgressScreen;
