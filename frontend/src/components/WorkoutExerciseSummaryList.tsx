import type { Workout } from '../services/api';
import { getExerciseMeta, getStructuredWorkoutExercises } from '../utils/workoutDisplay';

type WorkoutExerciseSummaryListProps = {
  workout: Workout;
};

export function WorkoutExerciseSummaryList({ workout }: WorkoutExerciseSummaryListProps) {
  const workoutExercises = getStructuredWorkoutExercises(workout);

  if (workoutExercises.length === 0) {
    return null;
  }

  return (
    <div className="workout-exercise-summary-list">
      {workoutExercises.map((exercise, index) => {
        const exerciseMeta = getExerciseMeta(exercise);

        return (
          <div className="workout-exercise-summary-item" key={`${exercise.name}-${index}`}>
            <strong>{exercise.name}</strong>
            {exerciseMeta && <span>{exerciseMeta}</span>}
            {exercise.notes && <p>{exercise.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}
