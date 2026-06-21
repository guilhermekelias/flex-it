import type { Workout } from '../services/api';

export function getStructuredWorkoutExercises(workout: Workout) {
  return Array.isArray(workout.exercises)
    ? workout.exercises.filter((exercise) => exercise.name.trim())
    : [];
}

export function getExerciseMeta(exercise: ReturnType<typeof getStructuredWorkoutExercises>[number]) {
  const meta: string[] = [];

  if (exercise.sets) {
    meta.push(`${exercise.sets} séries`);
  }

  if (exercise.reps) {
    meta.push(`${exercise.reps} reps`);
  }

  if (exercise.rest) {
    meta.push(`${exercise.rest} descanso`);
  }

  return meta.join(' | ');
}
