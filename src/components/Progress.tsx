import React from 'react';
import { AppState, Exercise } from '../types';
import { formatExerciseName, getWeekName, calculateVolume, estimateOneRepMax } from '../utils/531-calculations';

interface ProgressProps {
  appState: AppState;
}

const Progress: React.FC<ProgressProps> = ({ appState }) => {
  const { workouts, user } = appState;
  const exercises: Exercise[] = ['squat', 'bench', 'deadlift', 'overhead_press'];

  // Calculate stats for each exercise
  const getExerciseStats = (exercise: Exercise): {
    totalSessions: number;
    totalVolume: number;
    bestAmrap: {
      weight: number;
      reps: number;
      date: Date;
      estimatedMax: number;
    } | null;
    estimatedMax: number;
    recentSessions: any[];
  } => {
    const exerciseWorkouts = workouts
      .filter(w => w.exercise === exercise)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (exerciseWorkouts.length === 0) {
      return {
        totalSessions: 0,
        totalVolume: 0,
        bestAmrap: null,
        estimatedMax: user.trainingMaxes[exercise] / 0.9,
        recentSessions: []
      };
    }

    const totalVolume = exerciseWorkouts.reduce((sum, workout) => {
      return sum + calculateVolume(workout.mainSets.map(set => ({
        weight: set.weight,
        reps: set.actualReps
      })));
    }, 0);

    // Find best AMRAP performance
    let bestAmrap: {
      weight: number;
      reps: number;
      date: Date;
      estimatedMax: number;
    } | null = null;

    exerciseWorkouts.forEach(workout => {
      workout.mainSets.forEach(set => {
        if (set.percentage >= 0.85 && set.actualReps > set.targetReps) {
          const setEstimatedMax = estimateOneRepMax(set.weight, set.actualReps);
          if (!bestAmrap || setEstimatedMax > bestAmrap.estimatedMax) {
            bestAmrap = {
              weight: set.weight,
              reps: set.actualReps,
              date: new Date(workout.date),
              estimatedMax: setEstimatedMax
            };
          }
        }
      });
    });

    const estimatedMax = bestAmrap ? (bestAmrap as { estimatedMax: number }).estimatedMax : user.trainingMaxes[exercise] / 0.9;

    return {
      totalSessions: exerciseWorkouts.length,
      totalVolume,
      bestAmrap,
      estimatedMax,
      recentSessions: exerciseWorkouts.slice(-5)
    };
  };

  const overallStats = {
    totalWorkouts: workouts.length,
    currentCycle: user.currentCycle,
    averageDuration: workouts.length > 0 
      ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length)
      : 0,
    totalVolume: workouts.reduce((sum, workout) => {
      return sum + calculateVolume(workout.mainSets.map(set => ({
        weight: set.weight,
        reps: set.actualReps
      })));
    }, 0)
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1 className="text-primary" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Progress & Statistics
        </h1>
        <p className="text-secondary">
          Track your strength gains and workout history
        </p>
      </header>

      {/* Overall Stats */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Overall Statistics
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="text-primary" style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>
              {overallStats.totalWorkouts}
            </div>
            <div className="text-secondary">Total Workouts</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div className="text-primary" style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>
              {overallStats.currentCycle}
            </div>
            <div className="text-secondary">Current Cycle</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div className="text-primary" style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>
              {overallStats.averageDuration}min
            </div>
            <div className="text-secondary">Avg Duration</div>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div className="text-primary" style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>
              {Math.round(overallStats.totalVolume).toLocaleString()}
            </div>
            <div className="text-secondary">Total Volume ({user.units})</div>
          </div>
        </div>
      </section>

      {/* Exercise-Specific Progress */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Exercise Progress
        </h2>

        <div style={{ display: 'grid', gap: '24px' }}>
          {exercises.map((exercise) => {
            const stats = getExerciseStats(exercise);
            
            return (
              <div key={exercise} className="card">
                <h3 className="text-accent" style={{ marginBottom: '16px' }}>
                  {formatExerciseName(exercise)}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      Training Max
                    </div>
                    <div className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {user.trainingMaxes[exercise]}{user.units}
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      Sessions
                    </div>
                    <div className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {stats.totalSessions}
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      Estimated 1RM
                    </div>
                    <div className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {Math.round(stats.estimatedMax)}{user.units}
                    </div>
                  </div>

                  <div>
                    <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      Total Volume
                    </div>
                    <div className="text-primary" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {Math.round(stats.totalVolume).toLocaleString()}
                    </div>
                  </div>
                </div>

                {stats.bestAmrap && (
                  <div>
                    <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>
                      Best AMRAP Performance:
                    </div>
                    <div className="text-accent">
                      {stats.bestAmrap.weight}{user.units} × {stats.bestAmrap.reps} reps
                      <span className="text-secondary" style={{ marginLeft: '8px' }}>
                        (Est. 1RM: {stats.bestAmrap.estimatedMax}{user.units})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Workout History */}
      <section>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Workout History
        </h2>

        {workouts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💪</div>
            <div className="text-primary" style={{ fontSize: '18px', marginBottom: '8px' }}>
              Ready to start your journey?
            </div>
            <div className="text-secondary" style={{ marginBottom: '24px' }}>
              Complete your first workout to see detailed progress tracking and statistics here.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workouts
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((workout) => (
                <div key={workout.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div className="text-accent" style={{ marginBottom: '4px' }}>
                        {formatExerciseName(workout.exercise)} • {getWeekName(workout.week)}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {new Date(workout.date).toLocaleDateString()}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '14px' }}>
                        {workout.mainSets.length} main sets • Volume: {Math.round(calculateVolume(workout.mainSets.map(set => ({ weight: set.weight, reps: set.actualReps }))))} {user.units} • {workout.duration}min
                      </div>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '14px' }}>
                      Cycle {workout.cycle}
                    </div>
                  </div>
                  {workout.notes && (
                    <div className="text-secondary" style={{ fontSize: '14px', fontStyle: 'italic' }}>
                      "{workout.notes}"
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Progress;