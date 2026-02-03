import { NutritionInfo, OpenFoodFactsResponse } from '../app-types';

// Fetch product data from Open Food Facts API
export const fetchProductByBarcode = async (barcode: string): Promise<{
  name: string;
  brand?: string;
  nutrition: NutritionInfo;
  servingSize: string;
  imageUrl?: string;
  nutriscore?: string;
  novaGroup?: number;
  allergens?: string;
} | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    
    if (data.status !== 1 || !data.product) {
      return null;
    }
    
    const product = data.product;
    
    return {
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      nutrition: {
        calories: product.nutriments['energy-kcal_100g'] || 0,
        protein: product.nutriments.proteins_100g || 0,
        carbs: product.nutriments.carbohydrates_100g || 0,
        fat: product.nutriments.fat_100g || 0,
        fiber: product.nutriments.fiber_100g,
        sugar: product.nutriments.sugars_100g,
        salt: product.nutriments.salt_100g,
      },
      servingSize: product.serving_size || '100g',
      imageUrl: product.image_front_url,
      nutriscore: product.nutriscore_grade,
      novaGroup: product.nova_group,
      allergens: product.allergens,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Search products by name
export const searchProducts = async (query: string): Promise<Array<{
  barcode: string;
  name: string;
  brand?: string;
  nutrition: NutritionInfo;
}>> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    
    const data = await response.json();
    
    return data.products.map((product: any) => ({
      barcode: product.code,
      name: product.product_name || 'Unknown',
      brand: product.brands,
      nutrition: {
        calories: product.nutriments?.['energy-kcal_100g'] || 0,
        protein: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
      },
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Calculate nutrition totals
export const calculateTotals = (nutrition: NutritionInfo, servings: number): NutritionInfo => {
  return {
    calories: Math.round(nutrition.calories * servings),
    protein: Math.round(nutrition.protein * servings),
    carbs: Math.round(nutrition.carbs * servings),
    fat: Math.round(nutrition.fat * servings),
    fiber: nutrition.fiber ? Math.round(nutrition.fiber * servings) : undefined,
    sugar: nutrition.sugar ? Math.round(nutrition.sugar * servings) : undefined,
    salt: nutrition.salt ? Math.round(nutrition.salt * servings * 1000) / 1000 : undefined,
  };
};
