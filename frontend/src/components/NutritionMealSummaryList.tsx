import type { NutritionPlan } from '../services/api';
import { getNutritionFoodMeta, getStructuredNutritionMeals } from '../utils/nutritionDisplay';

type NutritionMealSummaryListProps = {
  nutritionPlan: NutritionPlan;
};

export function NutritionMealSummaryList({ nutritionPlan }: NutritionMealSummaryListProps) {
  const nutritionPlanMeals = getStructuredNutritionMeals(nutritionPlan);

  if (nutritionPlanMeals.length === 0) {
    return null;
  }

  return (
    <div className="nutrition-meal-summary-list">
      {nutritionPlanMeals.map((meal, mealIndex) => (
        <section className="nutrition-meal-summary-item" key={`${meal.name}-${mealIndex}`}>
          <div className="nutrition-meal-summary-heading">
            <strong>{meal.name}</strong>
            {meal.time && <span>{meal.time}</span>}
          </div>

          <div className="nutrition-food-summary-list">
            {meal.foods.map((food, foodIndex) => {
              const foodMeta = getNutritionFoodMeta(food);

              return (
                <div className="nutrition-food-summary-item" key={`${food.name}-${foodIndex}`}>
                  <strong>{food.name}</strong>
                  {foodMeta && <span>{foodMeta}</span>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
