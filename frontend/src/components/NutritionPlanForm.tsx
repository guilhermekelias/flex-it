import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type {
  NutritionPlan,
  NutritionPlanFood,
  NutritionPlanMeal,
  NutritionPlanPayload,
} from '../services/api';

export type NutritionPlanFoodFormValues = {
  name: string;
  quantity: string;
  calories: string;
};

export type NutritionPlanMealFormValues = {
  name: string;
  time: string;
  foods: NutritionPlanFoodFormValues[];
};

export type NutritionPlanFormValues = {
  name: string;
  objective: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  mealsCount: string;
  meals: NutritionPlanMealFormValues[];
  usesStructuredMeals: boolean;
  hasStructuredMeals: boolean;
  notes: string;
};

type NutritionPlanFormProps = {
  values: NutritionPlanFormValues;
  isEditing: boolean;
  isSubmitting: boolean;
  onValuesChange: (values: NutritionPlanFormValues) => void;
  onSubmit: (nutritionPlanData: NutritionPlanPayload) => void;
  onCancelEdit: () => void;
};

type NutritionPlanTextField =
  | 'name'
  | 'objective'
  | 'calories'
  | 'proteinGrams'
  | 'carbsGrams'
  | 'fatGrams'
  | 'mealsCount'
  | 'notes';

const DEFAULT_NUTRITION_MEALS = [
  { name: 'Caf\u00e9 da Manh\u00e3', time: '07:00' },
  { name: 'Lanche da Manh\u00e3', time: '10:00' },
  { name: 'Almo\u00e7o', time: '12:30' },
  { name: 'Lanche da Tarde', time: '16:00' },
  { name: 'Jantar', time: '19:30' },
  { name: 'Ceia', time: '22:00' },
];

function createEmptyFoodFormValues(): NutritionPlanFoodFormValues {
  return {
    name: '',
    quantity: '',
    calories: '',
  };
}

function createEmptyMealFormValues(): NutritionPlanMealFormValues {
  return {
    name: '',
    time: '',
    foods: [createEmptyFoodFormValues()],
  };
}

function createDefaultMealFormValues(): NutritionPlanMealFormValues[] {
  return DEFAULT_NUTRITION_MEALS.map((meal) => ({
    ...meal,
    foods: [createEmptyFoodFormValues()],
  }));
}

function getNutritionPlanMeals(nutritionPlan: NutritionPlan): NutritionPlanMeal[] {
  return Array.isArray(nutritionPlan.meals)
    ? nutritionPlan.meals.filter(
        (meal) => meal.name.trim() && Array.isArray(meal.foods) && meal.foods.length > 0,
      )
    : [];
}

function countValidMeals(meals: NutritionPlanMealFormValues[]): number {
  return meals.filter(
    (meal) => meal.name.trim() && meal.foods.some((food) => food.name.trim()),
  ).length;
}

function syncStructuredMealCount(values: NutritionPlanFormValues): NutritionPlanFormValues {
  return {
    ...values,
    mealsCount: String(countValidMeals(values.meals)),
  };
}

export function createEmptyNutritionPlanFormValues(): NutritionPlanFormValues {
  return {
    name: '',
    objective: '',
    calories: '',
    proteinGrams: '',
    carbsGrams: '',
    fatGrams: '',
    mealsCount: '0',
    meals: createDefaultMealFormValues(),
    usesStructuredMeals: true,
    hasStructuredMeals: false,
    notes: '',
  };
}

export function getNutritionPlanFormValues(
  nutritionPlan: NutritionPlan,
): NutritionPlanFormValues {
  const meals = getNutritionPlanMeals(nutritionPlan);

  return {
    name: nutritionPlan.name,
    objective: nutritionPlan.objective,
    calories: String(nutritionPlan.calories),
    proteinGrams: String(nutritionPlan.proteinGrams),
    carbsGrams: String(nutritionPlan.carbsGrams),
    fatGrams: String(nutritionPlan.fatGrams),
    mealsCount: String(nutritionPlan.mealsCount),
    meals:
      meals.length > 0
        ? meals.map((meal) => ({
            name: meal.name,
            time: meal.time || '',
            foods: meal.foods.map((food) => ({
              name: food.name,
              quantity: food.quantity || '',
              calories: food.calories ? String(food.calories) : '',
            })),
          }))
        : [],
    usesStructuredMeals: meals.length > 0,
    hasStructuredMeals: meals.length > 0,
    notes: nutritionPlan.notes || '',
  };
}

function parseInteger(value: string, errorMessage: string): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue)) {
    throw new Error(errorMessage);
  }

  return parsedValue;
}

export function NutritionPlanForm({
  values,
  isEditing,
  isSubmitting,
  onValuesChange,
  onSubmit,
  onCancelEdit,
}: NutritionPlanFormProps) {
  const [formError, setFormError] = useState('');

  const updateValue = (field: NutritionPlanTextField, value: string) => {
    setFormError('');
    onValuesChange({
      ...values,
      [field]: value,
    });
  };

  const updateMealValue = (
    index: number,
    field: keyof Pick<NutritionPlanMealFormValues, 'name' | 'time'>,
    value: string,
  ) => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: values.meals.map((meal, currentIndex) =>
          currentIndex === index
            ? {
                ...meal,
                [field]: value,
              }
            : meal,
        ),
      }),
    );
  };

  const updateFoodValue = (
    mealIndex: number,
    foodIndex: number,
    field: keyof NutritionPlanFoodFormValues,
    value: string,
  ) => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: values.meals.map((meal, currentMealIndex) =>
          currentMealIndex === mealIndex
            ? {
                ...meal,
                foods: meal.foods.map((food, currentFoodIndex) =>
                  currentFoodIndex === foodIndex
                    ? {
                        ...food,
                        [field]: value,
                      }
                    : food,
                ),
              }
            : meal,
        ),
      }),
    );
  };

  const addMeal = () => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: [...values.meals, createEmptyMealFormValues()],
      }),
    );
  };

  const removeMeal = (index: number) => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: values.meals.filter((_meal, currentIndex) => currentIndex !== index),
      }),
    );
  };

  const addFood = (mealIndex: number) => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: values.meals.map((meal, currentIndex) =>
          currentIndex === mealIndex
            ? {
                ...meal,
                foods: [...meal.foods, createEmptyFoodFormValues()],
              }
            : meal,
        ),
      }),
    );
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    setFormError('');
    onValuesChange(
      syncStructuredMealCount({
        ...values,
        usesStructuredMeals: true,
        meals: values.meals.map((meal, currentIndex) => {
          if (currentIndex !== mealIndex) {
            return meal;
          }

          const remainingFoods = meal.foods.filter(
            (_food, currentFoodIndex) => currentFoodIndex !== foodIndex,
          );

          return {
            ...meal,
            foods: remainingFoods.length > 0 ? remainingFoods : [createEmptyFoodFormValues()],
          };
        }),
      }),
    );
  };

  const normalizeMeals = (): NutritionPlanMeal[] | null => {
    const normalizedMeals: NutritionPlanMeal[] = [];

    for (const [mealIndex, meal] of values.meals.entries()) {
      const name = meal.name.trim();
      const time = meal.time.trim();
      const foods: NutritionPlanFood[] = [];

      for (const [foodIndex, food] of meal.foods.entries()) {
        const foodName = food.name.trim();
        const quantity = food.quantity.trim();
        const calories = food.calories.trim();
        const hasAnyFoodValue = Boolean(foodName || quantity || calories);

        if (!hasAnyFoodValue) {
          continue;
        }

        if (!foodName) {
          setFormError(
            `Informe o nome do alimento ${foodIndex + 1} em ${name || `refeição ${mealIndex + 1}`}.`,
          );
          return null;
        }

        const caloriesValue = calories ? Number(calories) : null;

        if (caloriesValue !== null && (!Number.isFinite(caloriesValue) || caloriesValue <= 0)) {
          setFormError(`Calorias do alimento ${foodIndex + 1} devem ser um número positivo.`);
          return null;
        }

        foods.push({
          name: foodName,
          quantity: quantity || null,
          calories: caloriesValue,
        });
      }

      if (foods.length === 0) {
        continue;
      }

      if (!name) {
        setFormError(`Informe o nome da refeição ${mealIndex + 1}.`);
        return null;
      }

      normalizedMeals.push({
        name,
        time: time || null,
        foods,
      });
    }

    return normalizedMeals;
  };

  const handleSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault();

    try {
      const name = values.name.trim();
      const objective = values.objective.trim();
      const calories = parseInteger(values.calories, 'Calorias devem ser um número inteiro.');
      const proteinGrams = parseInteger(
        values.proteinGrams,
        'Proteínas devem ser um número inteiro.',
      );
      const carbsGrams = parseInteger(
        values.carbsGrams,
        'Carboidratos devem ser um número inteiro.',
      );
      const fatGrams = parseInteger(values.fatGrams, 'Gorduras devem ser um número inteiro.');
      const mealsCount = values.mealsCount.trim()
        ? parseInteger(values.mealsCount, 'Refeições devem ser um número inteiro.')
        : 0;

      if (!name || !objective) {
        setFormError('Preencha nome e objetivo do plano alimentar.');
        return;
      }

      if (calories <= 0) {
        setFormError('Calorias devem ser maiores que zero.');
        return;
      }

      if (proteinGrams < 0 || carbsGrams < 0 || fatGrams < 0) {
        setFormError('Macros devem ser zero ou maiores.');
        return;
      }

      const normalizedMeals = normalizeMeals();

      if (!normalizedMeals) {
        return;
      }

      if (normalizedMeals.length === 0) {
        setFormError('Adicione pelo menos uma refeição com alimento antes de salvar.');
        return;
      }

      if (mealsCount < 0) {
        setFormError('Refeições devem ser maiores que zero.');
        return;
      }

      const notes = values.notes.trim();
      const nutritionPlanData: NutritionPlanPayload = {
        name,
        objective,
        calories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        mealsCount: normalizedMeals.length,
        meals: normalizedMeals,
        notes: notes || null,
      };

      onSubmit(nutritionPlanData);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Plano alimentar inválido.');
    }
  };

  return (
    <form className="student-form nutrition-plan-form" onSubmit={handleSubmit}>
      <label>
        <span>Nome do plano</span>
        <input
          onInput={(event) => updateValue('name', (event.target as HTMLInputElement).value)}
          placeholder="Ex: Plano de hipertrofia"
          required
          type="text"
          value={values.name}
        />
      </label>

      <label>
        <span>Objetivo</span>
        <input
          onInput={(event) => updateValue('objective', (event.target as HTMLInputElement).value)}
          placeholder="Hipertrofia, emagrecimento, manutenção"
          required
          type="text"
          value={values.objective}
        />
      </label>

      <div className="student-form-row">
        <label>
          <span>Calorias</span>
          <input
            min="1"
            onInput={(event) => updateValue('calories', (event.target as HTMLInputElement).value)}
            placeholder="2200"
            required
            type="number"
            value={values.calories}
          />
        </label>

        <label>
          <span>Refeições</span>
          <input
            min="0"
            placeholder="0"
            readOnly
            type="number"
            value={values.mealsCount}
          />
        </label>
      </div>

      <div className="student-form-row">
        <label>
          <span>Proteínas g</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('proteinGrams', (event.target as HTMLInputElement).value)
            }
            placeholder="150"
            required
            type="number"
            value={values.proteinGrams}
          />
        </label>

        <label>
          <span>Carboidratos g</span>
          <input
            min="0"
            onInput={(event) =>
              updateValue('carbsGrams', (event.target as HTMLInputElement).value)
            }
            placeholder="280"
            required
            type="number"
            value={values.carbsGrams}
          />
        </label>
      </div>

      <label>
        <span>Gorduras g</span>
        <input
          min="0"
          onInput={(event) => updateValue('fatGrams', (event.target as HTMLInputElement).value)}
          placeholder="70"
          required
          type="number"
          value={values.fatGrams}
        />
      </label>

      <section className="nutrition-meals-section" aria-labelledby="nutrition-meals-title">
        <div className="nutrition-meals-heading">
          <div>
            <span id="nutrition-meals-title">Refeições do dia</span>
            <small>{countValidMeals(values.meals)} refeições com alimentos</small>
          </div>

          <button className="nutrition-meal-add-button" onClick={addMeal} type="button">
            + Refeição
          </button>
        </div>

        {values.meals.length === 0 ? (
          <p className="nutrition-meals-empty">
            Nenhuma refeição adicionada. Use o botão acima para montar o plano.
          </p>
        ) : (
          <div className="nutrition-meal-editor-list">
            {values.meals.map((meal, mealIndex) => (
              <article className="nutrition-meal-editor" key={mealIndex}>
                <div className="nutrition-meal-editor-heading">
                  <span className="nutrition-meal-index" aria-label={`Refeição ${mealIndex + 1}`}>
                    {mealIndex + 1}
                  </span>

                  <label>
                    <span>Refeição</span>
                    <input
                      onInput={(event) =>
                        updateMealValue(
                          mealIndex,
                          'name',
                          (event.target as HTMLInputElement).value,
                        )
                      }
                      placeholder="Ex: Café da Manhã"
                      type="text"
                      value={meal.name}
                    />
                  </label>

                  <label>
                    <span>Horario</span>
                    <input
                      onInput={(event) =>
                        updateMealValue(
                          mealIndex,
                          'time',
                          (event.target as HTMLInputElement).value,
                        )
                      }
                      placeholder="07:00"
                      type="text"
                      value={meal.time}
                    />
                  </label>

                  <button
                    className="nutrition-meal-remove-button"
                    onClick={() => removeMeal(mealIndex)}
                    type="button"
                  >
                    Remover refeição
                  </button>
                </div>

                <div className="nutrition-food-editor-list">
                  {meal.foods.map((food, foodIndex) => (
                    <div className="nutrition-food-editor" key={foodIndex}>
                      <label className="nutrition-food-name-field">
                        <span>Alimento</span>
                        <input
                          onInput={(event) =>
                            updateFoodValue(
                              mealIndex,
                              foodIndex,
                              'name',
                              (event.target as HTMLInputElement).value,
                            )
                          }
                          placeholder="Ex: Ovos"
                          type="text"
                          value={food.name}
                        />
                      </label>

                      <label>
                        <span>Quantidade</span>
                        <input
                          onInput={(event) =>
                            updateFoodValue(
                              mealIndex,
                              foodIndex,
                              'quantity',
                              (event.target as HTMLInputElement).value,
                            )
                          }
                          placeholder="100g"
                          type="text"
                          value={food.quantity}
                        />
                      </label>

                      <label>
                        <span>Kcal</span>
                        <input
                          min="1"
                          onInput={(event) =>
                            updateFoodValue(
                              mealIndex,
                              foodIndex,
                              'calories',
                              (event.target as HTMLInputElement).value,
                            )
                          }
                          placeholder="140"
                          type="number"
                          value={food.calories}
                        />
                      </label>

                      <button
                        className="nutrition-food-remove-button"
                        onClick={() => removeFood(mealIndex, foodIndex)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="nutrition-food-add-button"
                  onClick={() => addFood(mealIndex)}
                  type="button"
                >
                  + Adicionar alimento
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <label>
        <span>Observações</span>
        <input
          onInput={(event) => updateValue('notes', (event.target as HTMLInputElement).value)}
          placeholder="Orientações gerais do plano"
          type="text"
          value={values.notes}
        />
      </label>

      <div className="workout-form-actions">
        {isEditing && (
          <button className="dashboard-secondary-button" onClick={onCancelEdit} type="button">
            Cancelar edição
          </button>
        )}

        <button className="dashboard-primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar plano' : 'Criar plano'}
        </button>
      </div>

      {formError && <p className="student-detail-observation-feedback">{formError}</p>}
    </form>
  );
}
