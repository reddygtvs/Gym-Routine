import React from 'react';
import { Link } from 'react-router-dom';
import { AppState, Exercise, WeekType } from '../types';
import { WEEK_PERCENTAGES, formatExerciseName, getWeekName, calculateWorkingWeight } from '../utils/531-calculations';

interface DashboardProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appState }) => {
  const { user, workouts } = appState;
  
  // Calculate current week based on completed sessions in current cycle
  // Each cycle has 4 exercises × 4 weeks = 16 total sessions
  const sessionsInCurrentCycle = workouts.filter(w => w.cycle === user.currentCycle).length;
  const currentWeek = Math.floor(sessionsInCurrentCycle / 4) + 1 as WeekType;
  const normalizedWeek = Math.min(currentWeek, 4) as WeekType; // Cap at week 4
  
  const exercises: Exercise[] = ['squat', 'bench', 'deadlift', 'overhead_press'];
  
  // Get recent workouts for each exercise
  const getRecentWorkout = (exercise: Exercise) => {
    return workouts
      .filter(w => w.exercise === exercise)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  // Calculate next session preview
  const getNextSessionPreview = (exercise: Exercise, week: WeekType) => {
    const trainingMax = user.trainingMaxes[exercise];
    const weekProgram = WEEK_PERCENTAGES[week];
    
    return weekProgram.map(set => ({
      ...set,
      weight: calculateWorkingWeight(trainingMax, set.percentage, user.units)
    }));
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <header style={{ marginBottom: '64px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span className="text-secondary">
            {user.name ? `Welcome back, ${user.name}` : 'Welcome back'}
          </span>
        </div>
        <h1 className="text-primary" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Cycle {user.currentCycle} • {getWeekName(normalizedWeek)}
        </h1>
        <p className="text-secondary">
          {user.preferredVariant.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Program
        </p>
      </header>

      {/* Current Week Overview */}
      <section style={{ marginBottom: '64px' }}>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          This Week's Sessions
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {exercises.map((exercise) => {
            const recentWorkout = getRecentWorkout(exercise);
            const nextSession = getNextSessionPreview(exercise, normalizedWeek);
            
            // Check if this exercise is completed for the current week
            const isCompleted = workouts.some(w => 
              w.exercise === exercise && 
              w.week === normalizedWeek && 
              w.cycle === user.currentCycle
            );

            return (
              <Link
                key={exercise}
                to={`/workout/${exercise}/${normalizedWeek}`}
                style={{ textDecoration: 'none' }}
              >
                <div 
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isCompleted ? 0.6 : 1,
                    border: isCompleted 
                      ? '1px solid rgb(55, 55, 53)' 
                      : '1px solid rgb(55, 55, 53)'
                  }}
                >
                  <div>
                    <div className="text-accent" style={{ marginBottom: '4px' }}>
                      {formatExerciseName(exercise)}
                      {isCompleted && (
                        <span style={{ marginLeft: '8px', color: 'rgb(34, 197, 94)' }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '14px' }}>
                      {nextSession.map((set, idx) => (
                        <span key={idx}>
                          {set.weight}{user.units} × {set.reps}{set.isAmrap ? '+' : ''}
                          {idx < nextSession.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-secondary" style={{ fontSize: '24px' }}>
                    →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Recent Activity
        </h2>
        
        {workouts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="text-secondary" style={{ marginBottom: '16px' }}>
              No workouts completed yet
            </div>
            <p className="text-secondary">
              Start your first workout above to begin tracking your progress!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workouts
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((workout) => (
                <div key={workout.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-accent" style={{ marginBottom: '4px' }}>
                        {formatExerciseName(workout.exercise)} • {getWeekName(workout.week)}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '14px' }}>
                        {new Date(workout.date).toLocaleDateString()} • {workout.duration}min
                      </div>
                    </div>
                    <div className="text-secondary">
                      Cycle {workout.cycle}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;