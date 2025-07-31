export type Exercise = 'squat' | 'bench' | 'deadlift' | 'overhead_press';
export type WeekType = 1 | 2 | 3 | 4;
export type ProgramVariant = 'standard' | 'boring_but_big' | 'building_the_monolith' | 'triumvirate' | 'fsl' | 'joker_sets';

export interface MainSet {
  percentage: number;
  reps: number;
  isAmrap?: boolean;
}

export interface WorkoutSet {
  percentage: number;
  targetReps: number;
  actualReps: number;
  weight: number;
  rpe?: number;
}

export interface AccessoryExercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

export interface Cycle {
  id: string;
  number: number;
  startDate: Date;
  endDate?: Date;
  trainingMaxes: Record<Exercise, number>;
}

export interface Workout {
  id: string;
  date: Date;
  exercise: Exercise;
  week: WeekType;
  cycle: number;
  mainSets: WorkoutSet[];
  accessoryWork: AccessoryExercise[];
  notes?: string;
  duration: number; // in minutes
}

export interface ProgressEntry {
  id: string;
  date: Date;
  exercise: Exercise;
  estimatedMax: number;
  volume: number;
  intensity: number;
}

export interface UserProfile {
  name?: string;
  startDate: Date;
  currentCycle: number;
  trainingMaxes: Record<Exercise, number>;
  preferredVariant: ProgramVariant;
  accessoryPreferences: string[];
  units: 'kg' | 'lbs';
  bodyweight?: number;
}

export interface AppState {
  user: UserProfile;
  cycles: Cycle[];
  workouts: Workout[];
  progress: ProgressEntry[];
}