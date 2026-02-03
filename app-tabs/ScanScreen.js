import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Modal, Image } from 'react-native';
import { Camera, BarCodeScanner } from 'expo-camera';
import { fetchProductByBarcode } from '../app-lib/api';
import { addFoodToDiary, saveFoodToHistory } from '../app-lib/storage';

const ScanScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [servings, setServings] = useState('1');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('lunch');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    setScanned(true);
    setBarcode(data);
    await lookupProduct(data);
  };

  const lookupProduct = async (barcode: string) => {
    setLoading(true);
    const result = await fetchProductByBarcode(barcode);
    setProduct(result);
    setLoading(false);
    setAdded(false);
  };

  const handleManualLookup = async () => {
    if (barcode.trim()) {
      setShowManual(false);
      await lookupProduct(barcode.trim());
    }
  };

  const handleAddToDiary = async () => {
    if (product && servings) {
      await addFoodToDiary({
        barcode: product.barcode || barcode,
        name: product.name,
        brand: product.brand,
        servingSize: product.servingSize,
        calories: product.nutrition.calories,
        protein: product.nutrition.protein,
        carbs: product.nutrition.carbs,
        fat: product.nutrition.fat,
        fiber: product.nutrition.fiber,
        sugar: product.nutrition.sugar,
        salt: product.nutrition.salt,
        imageUrl: product.imageUrl,
        servings: parseFloat(servings) || 1,
      }, mealType);
      
      await saveFoodToHistory({
        barcode: product.barcode || barcode,
        name: product.name,
        brand: product.brand,
        servingSize: product.servingSize,
        calories: product.nutrition.calories,
        protein: product.nutrition.protein,
        carbs: product.nutrition.carbs,
        fat: product.nutrition.fat,
        consumedDate: new Date().toISOString(),
        consumedMeal: mealType,
        servings: parseFloat(servings) || 1,
      });

      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setProduct(null);
        setBarcode('');
        setServings('1');
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>No access to camera</Text>
        <Text style={styles.noPermissionSub}>Enable camera permissions in Settings to scan barcodes</Text>
        <TouchableOpacity style={styles.manualButton} onPress={() => setShowManual(true)}>
          <Text style={styles.manualButtonText}>Enter Barcode Manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scanning) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Point camera at barcode</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setScanning(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📷 Scan Food</Text>
      </View>

      {!product && (
        <View style={styles.scanOptions}>
          <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
            <Text style={styles.scanButtonText}>📷 Scan Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualButton} onPress={() => setShowManual(true)}>
            <Text style={styles.manualButtonText}>🔢 Enter Manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Looking up product...</Text>
        </View>
      )}

      {product && !loading && (
        <ScrollView style={styles.content}>
          <View style={styles.productCard}>
            {product.imageUrl && (
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            )}
            <Text style={styles.productName}>{product.name}</Text>
            {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
            
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutrition.protein}g</Text>
                <Text style={styles.nutritionLabel}>protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutrition.carbs}g</Text>
                <Text style={styles.nutritionLabel}>carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutrition.fat}g</Text>
                <Text style={styles.nutritionLabel}>fat</Text>
              </View>
            </View>
            
            <Text style={styles.servingInfo}>per {product.servingSize}</Text>
          </View>

          {/* Add to Meal */}
          <View style={styles.addSection}>
            <Text style={styles.sectionTitle}>Add to Meal</Text>
            <View style={styles.mealButtons}>
              {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                <TouchableOpacity
                  key={meal}
                  style={[styles.mealButton, mealType === meal && styles.mealButtonActive]}
                  onPress={() => setMealType(meal as any)}
                >
                  <Text style={[styles.mealButtonText, mealType === meal && styles.mealButtonTextActive]}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Servings</Text>
            <View style={styles.servingRow}>
              <TouchableOpacity style={styles.servingButton} onPress={() => setServings(String(Math.max(0.25, parseFloat(servings) - 0.25)))}>
                <Text style={styles.servingButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.servingInput}
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.servingButton} onPress={() => setServings(String(parseFloat(servings) + 0.25))}>
                <Text style={styles.servingButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddToDiary}>
              <Text style={styles.addButtonText}>
                {added ? '✓ Added to Diary!' : `+ Add ${servings} serving(s)`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Manual Entry Modal */}
      <Modal visible={showManual} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Barcode</Text>
            <TextInput
              style={styles.modalInput}
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Enter barcode number"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowManual(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleManualLookup}>
                <Text style={styles.modalConfirmText}>Lookup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  scanOptions: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scanButton: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 12, marginBottom: 16, width: '100%', alignItems: 'center' },
  scanButtonText: { fontSize: 18, fontWeight: '600', color: 'white' },
  manualButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  manualButtonText: { fontSize: 16, color: '#333' },
  content: { flex: 1, padding: 16 },
  productCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  productImage: { width: 150, height: 150, borderRadius: 8, marginBottom: 12 },
  productName: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  productBrand: { fontSize: 14, color: '#666', marginBottom: 16 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  nutritionItem: { alignItems: 'center', padding: 12, minWidth: 70 },
  nutritionValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  nutritionLabel: { fontSize: 12, color: '#666' },
  servingInfo: { fontSize: 12, color: '#999' },
  addSection: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  mealButtons: { flexDirection: 'row', marginBottom: 16 },
  mealButton: { flex: 1, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginHorizontal: 4 },
  mealButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  mealButtonText: { fontSize: 14, color: '#666' },
  mealButtonTextActive: { color: 'white', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  servingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  servingButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, width: 50, alignItems: 'center' },
  servingButtonText: { fontSize: 20, fontWeight: '600' },
  servingInput: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginHorizontal: 16 },
  addButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' },
  addButtonText: { fontSize: 18, fontWeight: '600', color: 'white' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 150, borderWidth: 2, borderColor: '#4CAF50', borderRadius: 8 },
  scanText: { color: 'white', fontSize: 16, marginTop: 16, marginBottom: 32 },
  cancelButton: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginTop: 20 },
  cancelButtonText: { fontSize: 16, color: '#333' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  noPermissionText: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  noPermissionSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 16 },
  modalButtons: { flexDirection: 'row' },
  modalCancel: { flex: 1, padding: 12, alignItems: 'center' },
  modalCancelText: { fontSize: 16, color: '#666' },
  modalConfirm: { flex: 1, padding: 12, alignItems: 'center' },
  modalConfirmText: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
});

export default ScanScreen;
