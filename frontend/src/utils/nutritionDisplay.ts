import type { NutritionPlan } from '../services/api';

export function getStructuredNutritionMeals(nutritionPlan: NutritionPlan) {
  return Array.isArray(nutritionPlan.meals)
    ? nutritionPlan.meals
        .map((meal) => ({
          ...meal,
          foods: Array.isArray(meal.foods)
            ? meal.foods.filter((food) => food.name.trim())
            : [],
        }))
        .filter((meal) => meal.name.trim() && meal.foods.length > 0)
    : [];
}

export function getNutritionFoodMeta(
  food: ReturnType<typeof getStructuredNutritionMeals>[number]['foods'][number],
) {
  const meta: string[] = [];

  if (food.quantity) {
    meta.push(food.quantity);
  }

  if (typeof food.calories === 'number' && Number.isFinite(food.calories)) {
    meta.push(`${food.calories} kcal`);
  }

  return meta.join(' | ');
}
