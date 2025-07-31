import { WeekType, MainSet, Exercise, ProgramVariant } from '../types';

// Standard 5/3/1 percentage schemes
export const WEEK_PERCENTAGES: Record<WeekType, MainSet[]> = {
  1: [
    { percentage: 0.65, reps: 5 },
    { percentage: 0.75, reps: 5 },
    { percentage: 0.85, reps: 5, isAmrap: true }
  ],
  2: [
    { percentage: 0.70, reps: 3 },
    { percentage: 0.80, reps: 3 },
    { percentage: 0.90, reps: 3, isAmrap: true }
  ],
  3: [
    { percentage: 0.75, reps: 5 },
    { percentage: 0.85, reps: 3 },
    { percentage: 0.95, reps: 1, isAmrap: true }
  ],
  4: [ // Deload week
    { percentage: 0.40, reps: 5 },
    { percentage: 0.50, reps: 5 },
    { percentage: 0.60, reps: 5 }
  ]
};

// Calculate working weight from training max and percentage
export function calculateWorkingWeight(trainingMax: number, percentage: number, units: 'kg' | 'lbs' = 'kg'): number {
  const weight = trainingMax * percentage;
  const increment = units === 'kg' ? 2.5 : 5;
  return Math.round(weight / increment) * increment;
}

// Calculate training max from 1RM
export function calculateTrainingMax(oneRepMax: number): number {
  return Math.round(oneRepMax * 0.9);
}

// Estimate 1RM from reps and weight using Epley formula
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// Calculate new training max based on AMRAP performance
export function calculateNewTrainingMax(
  currentTM: number, 
  amrapReps: number, 
  targetReps: number
): number {
  // Conservative progression based on AMRAP performance
  if (amrapReps >= targetReps + 5) {
    // Excellent performance: increase by 10kg/20lbs
    return currentTM + 10;
  } else if (amrapReps >= targetReps + 3) {
    // Good performance: standard increase 5kg/10lbs
    return currentTM + 5;
  } else if (amrapReps >= targetReps) {
    // Minimum performance: small increase 2.5kg/5lbs
    return currentTM + 2.5;
  } else {
    // Poor performance: stay same or decrease
    return Math.max(currentTM - 5, currentTM * 0.9);
  }
}

// Get accessory work for different program variants
export function getAccessoryWork(variant: ProgramVariant, exercise: Exercise): string[] {
  const accessoryPrograms: Record<ProgramVariant, Record<Exercise, string[]>> = {
    standard: {
      squat: ['Leg Press 3x10-15', 'Leg Curls 3x10-15', 'Abs 3x15'],
      bench: ['DB Rows 3x10-15', 'DB Press 3x10-15', 'Triceps 3x15'],
      deadlift: ['Good Mornings 3x10', 'Hanging Leg Raises 3x15', 'Back Extensions 3x15'],
      overhead_press: ['Chin-ups 3x10-15', 'Dips 3x10-15', 'Barbell Curls 3x15']
    },
    boring_but_big: {
      squat: ['Squat 5x10 @ 50-60%', 'Leg Curls 3x10', 'Abs 3x10'],
      bench: ['Bench Press 5x10 @ 50-60%', 'DB Rows 3x10', 'Triceps 3x10'],
      deadlift: ['Deadlift 5x10 @ 50-60%', 'Good Mornings 3x10', 'Abs 3x10'],
      overhead_press: ['Overhead Press 5x10 @ 50-60%', 'Chin-ups 3x10', 'DB Curls 3x10']
    },
    building_the_monolith: {
      squat: ['Squat 5x5 @ 85%', 'Weighted Dips 100 reps', 'Chins 100 reps', 'Face Pulls 100'],
      bench: ['Bench 5x5 @ 85%', 'Weighted Chins 100 reps', 'Dips 100 reps', 'DB Rows 100'],
      deadlift: ['Deadlift 5x5 @ 85%', 'Chins 100 reps', 'Dips 100 reps', 'Shrugs 100'],
      overhead_press: ['OHP 5x5 @ 85%', 'Chins 100 reps', 'Dips 100 reps', 'Face Pulls 100']
    },
    triumvirate: {
      squat: ['Leg Press 4x15', 'Leg Curls 4x10', 'Abs 4x15'],
      bench: ['DB Rows 4x10', 'DB Bench 4x10', 'Barbell Curls 4x12'],
      deadlift: ['Good Mornings 4x10', 'Hanging Leg Raises 4x10', 'DB Rows 4x10'],
      overhead_press: ['Chin-ups 4x8', 'Dips 4x12', 'Barbell Curls 4x15']
    },
    fsl: {
      squat: ['First Set Last 3x5-8', 'Leg Press 3x12', 'Leg Curls 3x12'],
      bench: ['First Set Last 3x5-8', 'DB Rows 3x12', 'Triceps 3x12'],
      deadlift: ['First Set Last 3x5-8', 'Good Mornings 3x8', 'Abs 3x15'],
      overhead_press: ['First Set Last 3x5-8', 'Chin-ups 3x8', 'DB Curls 3x12']
    },
    joker_sets: {
      squat: ['Joker Sets (optional)', 'Leg Press 3x12', 'Abs 3x15'],
      bench: ['Joker Sets (optional)', 'DB Rows 3x12', 'Triceps 3x12'],
      deadlift: ['Joker Sets (optional)', 'Good Mornings 3x8', 'Back Extensions 3x12'],
      overhead_press: ['Joker Sets (optional)', 'Chin-ups 3x8', 'DB Curls 3x12']
    }
  };

  return accessoryPrograms[variant][exercise] || [];
}

// Calculate plates needed for a given weight (for plate calculator)
export function calculatePlates(weight: number, units: 'kg' | 'lbs' = 'kg'): Record<string, number> {
  const barWeight = units === 'kg' ? 20 : 45;
  const plateWeights = units === 'kg' 
    ? [25, 20, 15, 10, 5, 2.5, 1.25] 
    : [45, 35, 25, 10, 5, 2.5];
  
  let remainingWeight = (weight - barWeight) / 2; // Each side
  const plates: Record<string, number> = {};
  
  for (const plateWeight of plateWeights) {
    const count = Math.floor(remainingWeight / plateWeight);
    if (count > 0) {
      plates[`${plateWeight}${units}`] = count;
      remainingWeight -= count * plateWeight;
    }
  }
  
  return plates;
}

// Format exercise name for display
export function formatExerciseName(exercise: Exercise): string {
  const names: Record<Exercise, string> = {
    squat: 'Squat',
    bench: 'Bench Press',
    deadlift: 'Deadlift',
    overhead_press: 'Overhead Press'
  };
  return names[exercise];
}

// Get week name for display
export function getWeekName(week: WeekType): string {
  const names: Record<WeekType, string> = {
    1: 'Week 1 (5s)',
    2: 'Week 2 (3s)', 
    3: 'Week 3 (1s)',
    4: 'Week 4 (Deload)'
  };
  return names[week];
}

// Calculate total volume for a workout
export function calculateVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
}