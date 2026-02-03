import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { loadSettings, saveSettings } from '../app-lib/storage';
import { UserSettings } from '../app-types';

const SettingsScreen = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [edited, setEdited] = useState(false);
  const [tempSettings, setTempSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userSettings = await loadSettings();
    setSettings(userSettings);
    setTempSettings(userSettings);
  };

  const handleSave = async () => {
    if (tempSettings) {
      await saveSettings(tempSettings);
      setSettings(tempSettings);
      setEdited(false);
      Alert.alert('Success', 'Settings saved!');
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setEdited(false);
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (tempSettings) {
      setTempSettings({ ...tempSettings, [key]: value });
      setEdited(true);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '';
    return String(num);
  };

  if (!tempSettings) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Daily Goals</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Calorie Goal</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.dailyCalorieGoal)}
                onChangeText={(val) => updateSetting('dailyCalorieGoal', parseInt(val) || 2000)}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>kcal</Text>
            </View>

            <Text style={styles.cardLabel}>Protein Goal</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.dailyProteinGoal)}
                onChangeText={(val) => updateSetting('dailyProteinGoal', parseInt(val) || 150)}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>g</Text>
            </View>

            <Text style={styles.cardLabel}>Carbs Goal</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.dailyCarbsGoal)}
                onChangeText={(val) => updateSetting('dailyCarbsGoal', parseInt(val) || 250)}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>g</Text>
            </View>

            <Text style={styles.cardLabel}>Fat Goal</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.dailyFatGoal)}
                onChangeText={(val) => updateSetting('dailyFatGoal', parseInt(val) || 65)}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>g</Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Personal Info</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Weight Unit</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity
                style={[styles.pickerButton, tempSettings.weightUnit === 'kg' && styles.pickerButtonActive]}
                onPress={() => updateSetting('weightUnit', 'kg')}
              >
                <Text style={[styles.pickerButtonText, tempSettings.weightUnit === 'kg' && styles.pickerButtonTextActive]}>
                  Kilograms (kg)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, tempSettings.weightUnit === 'lbs' && styles.pickerButtonActive]}
                onPress={() => updateSetting('weightUnit', 'lbs')}
              >
                <Text style={[styles.pickerButtonText, tempSettings.weightUnit === 'lbs' && styles.pickerButtonTextActive]}>
                  Pounds (lbs)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardLabel}>Height (optional)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.height)}
                onChangeText={(val) => updateSetting('height', parseInt(val) || undefined)}
                keyboardType="numeric"
                placeholder="cm"
              />
              <Text style={styles.inputSuffix}>cm</Text>
            </View>

            <Text style={styles.cardLabel}>Age (optional)</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={formatNumber(tempSettings.age)}
                onChangeText={(val) => updateSetting('age', parseInt(val) || undefined)}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.cardLabel}>Gender</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity
                style={[styles.pickerButton, tempSettings.gender === 'male' && styles.pickerButtonActive]}
                onPress={() => updateSetting('gender', 'male')}
              >
                <Text style={[styles.pickerButtonText, tempSettings.gender === 'male' && styles.pickerButtonTextActive]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, tempSettings.gender === 'female' && styles.pickerButtonActive]}
                onPress={() => updateSetting('gender', 'female')}
              >
                <Text style={[styles.pickerButtonText, tempSettings.gender === 'female' && styles.pickerButtonTextActive]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Reminders</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Meal Reminders</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Water Reminders</Text>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Weekly Summary</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dataButton}>
              <Text style={styles.dataButtonText}>📤 Export Data (CSV)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dataButton}>
              <Text style={styles.dataButtonText}>📥 Import Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dataButton}>
              <Text style={styles.dataButtonText}>🗑️ Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>Food Diary v1.0</Text>
            <Text style={styles.aboutSubtext}>Data stored locally on device</Text>
            <Text style={styles.aboutSubtext}>Powered by Open Food Facts</Text>
          </View>
        </View>

        {/* Save/Cancel Buttons */}
        {edited && (
          <View style={styles.saveButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  cardLabel: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 8, marginTop: 12 },
  cardLabelFirst: { marginTop: 0 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  inputSuffix: { marginLeft: 8, fontSize: 14, color: '#666' },
  pickerRow: { flexDirection: 'row', marginBottom: 8 },
  pickerButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  pickerButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  pickerButtonText: { fontSize: 14, color: '#666' },
  pickerButtonTextActive: { color: 'white', fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  switchLabel: { fontSize: 16, color: '#333' },
  dataButton: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dataButtonText: { fontSize: 16, color: '#333' },
  aboutText: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  aboutSubtext: { fontSize: 13, color: '#999' },
  saveButtons: { flexDirection: 'row', marginTop: 20, marginBottom: 40 },
  saveButton: { flex: 1, backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  cancelButton: { flex: 1, backgroundColor: '#f0f0f0', padding: 16, borderRadius: 12, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { fontSize: 16, color: '#666' },
});

export default SettingsScreen;
