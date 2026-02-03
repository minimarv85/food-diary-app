// Types for Food Diary App

export interface FoodItem {
  barcode: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
  imageUrl?: string;
  consumedDate: string; // ISO date
  consumedMeal: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  servings: number;
}

export interface DailyLog {
  date: string;
  foods: FoodItem[];
  waterGlasses: number;
  weight?: number;
  exerciseMinutes?: number;
}

export interface UserSettings {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  weightUnit: 'kg' | 'lbs';
  height?: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name: string;
    brands?: string;
    nutriments: {
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
      salt_100g?: number;
    };
    image_front_url?: string;
    image_ingredients_url?: string;
    serving_size?: string;
    nutriscore_grade?: string;
    nova_group?: number;
    allergens?: string;
    ingredients_text_en?: string;
  };
}
