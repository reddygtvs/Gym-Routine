import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppState, Exercise, WeekType, Workout as WorkoutType, WorkoutSet, AccessoryExercise } from '../types';
import { 
  WEEK_PERCENTAGES, 
  formatExerciseName, 
  getWeekName, 
  calculateWorkingWeight,
  getAccessoryWork,
  calculatePlates
} from '../utils/531-calculations';

interface WorkoutProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const Workout: React.FC<WorkoutProps> = ({ appState, updateAppState }) => {
  const { exercise, week } = useParams<{ exercise: Exercise; week: string }>();
  const navigate = useNavigate();
  
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>([]);
  const [accessoryWork, setAccessoryWork] = useState<AccessoryExercise[]>([]);
  const [startTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!exercise || !week) {
    navigate('/dashboard');
    return null;
  }

  const weekNum = parseInt(week) as WeekType;
  const trainingMax = appState.user.trainingMaxes[exercise];
  const weekProgram = WEEK_PERCENTAGES[weekNum];
  const recommendedAccessories = getAccessoryWork(appState.user.preferredVariant, exercise);

  // Initialize workout sets
  useEffect(() => {
    const initialSets: WorkoutSet[] = weekProgram.map(set => ({
      percentage: set.percentage,
      targetReps: set.reps,
      actualReps: set.reps,
      weight: calculateWorkingWeight(trainingMax, set.percentage, appState.user.units),
      rpe: undefined
    }));
    setWorkoutSets(initialSets);

    // Initialize accessory work
    const initialAccessories: AccessoryExercise[] = recommendedAccessories.map(acc => {
      // Parse exercise name and details
      const setsMatch = acc.match(/(\d+)x/);
      const repsMatch = acc.match(/x(\d+(?:-\d+)?)/);
      const percentageMatch = acc.match(/@\s*(\d+(?:-\d+)?)%/);
      
      // Extract the exercise name (everything before the first number)
      // const nameMatch = acc.match(/^([^\d@]+)/);
      // const name = nameMatch ? nameMatch[1].trim() : acc;
      
      return {
        name: acc, // Use the full text for display
        sets: setsMatch ? parseInt(setsMatch[1]) : 3,
        reps: repsMatch ? repsMatch[1] : '10',
        weight: percentageMatch ? `${percentageMatch[1]}%` : undefined
      };
    });
    setAccessoryWork(initialAccessories);
  }, [exercise, weekNum, trainingMax, appState.user.units, appState.user.preferredVariant]);

  const updateSet = (index: number, field: keyof WorkoutSet, value: number) => {
    setWorkoutSets(prev => prev.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ));
  };

  const completeWorkout = () => {
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000); // minutes
    
    const newWorkout: WorkoutType = {
      id: `${exercise}-${weekNum}-${Date.now()}`,
      date: new Date(),
      exercise,
      week: weekNum,
      cycle: appState.user.currentCycle,
      mainSets: workoutSets,
      accessoryWork,
      notes: notes || undefined,
      duration
    };

    updateAppState({
      workouts: [...appState.workouts, newWorkout]
    });

    setIsCompleted(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (isCompleted) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', paddingTop: '64px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎉</div>
        <h1 className="text-primary" style={{ marginBottom: '16px' }}>
          Workout Completed!
        </h1>
        <p className="text-secondary">
          Great job on your {formatExerciseName(exercise)} session
        </p>
      </div>
    );
  }

  const currentSet = workoutSets[currentSetIndex];
  const plateBreakdown = currentSet ? calculatePlates(currentSet.weight, appState.user.units) : {};

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <div style={{ marginBottom: '8px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-secondary link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>
        <h1 className="text-primary" style={{ fontSize: '32px', marginBottom: '8px' }}>
          {formatExerciseName(exercise)}
        </h1>
        <p className="text-secondary">
          {getWeekName(weekNum)} • Training Max: {trainingMax}{appState.user.units}
        </p>
      </header>

      {/* Main Sets */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Main Sets
        </h2>

        {/* Current Set Display */}
        {currentSet && (
          <div style={{ 
            padding: '20px',
            border: '2px solid rgb(100, 100, 98)',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div className="text-secondary" style={{ marginBottom: '8px' }}>
              Set {currentSetIndex + 1} of {workoutSets.length}
            </div>
            <div className="text-primary" style={{ fontSize: '40px', fontWeight: 600, marginBottom: '8px' }}>
              {currentSet.weight}{appState.user.units}
            </div>
            <div className="text-accent" style={{ marginBottom: '16px' }}>
              {currentSet.targetReps}{currentSet.percentage === 0.85 || currentSet.percentage === 0.90 || currentSet.percentage === 0.95 ? '+' : ''} reps
              <span className="text-secondary" style={{ marginLeft: '8px' }}>
                ({Math.round(currentSet.percentage * 100)}%)
              </span>
            </div>

            {/* Plate Calculator */}
            {Object.keys(plateBreakdown).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div className="text-secondary" style={{ fontSize: '14px', marginBottom: '8px' }}>
                  Plates per side:
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(plateBreakdown).map(([plate, count]) => (
                    <span key={plate} className="text-accent" style={{ fontSize: '14px' }}>
                      {count}×{plate}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rep Input */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label className="text-secondary">Reps completed:</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '70px', textAlign: 'center' }}
                  value={currentSet.actualReps}
                  onChange={(e) => updateSet(currentSetIndex, 'actualReps', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '200px' }}>
                <span className="text-secondary" style={{ fontSize: '14px' }}>RPE:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentSet.rpe || 7}
                  onChange={(e) => updateSet(currentSetIndex, 'rpe', parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="text-accent" style={{ fontSize: '14px', minWidth: '20px' }}>{currentSet.rpe || 7}</span>
              </div>
            </div>
          </div>
        )}

        {/* Set Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentSetIndex(Math.max(0, currentSetIndex - 1))}
            disabled={currentSetIndex === 0}
          >
            Previous Set
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (currentSetIndex < workoutSets.length - 1) {
                setCurrentSetIndex(currentSetIndex + 1);
              }
            }}
            disabled={currentSetIndex === workoutSets.length - 1}
          >
            Next Set
          </button>
        </div>

        {/* All Sets Overview */}
        <div style={{ display: 'grid', gap: '8px' }}>
          {workoutSets.map((set, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                border: index === currentSetIndex 
                  ? '1px solid rgb(100, 100, 98)' 
                  : '1px solid rgb(55, 55, 53)',
                borderRadius: '6px',
                opacity: index === currentSetIndex ? 1 : 0.7
              }}
            >
              <div className="text-accent">
                Set {index + 1}: {set.weight}{appState.user.units} × {set.targetReps}{set.percentage >= 0.85 ? '+' : ''}
              </div>
              <div className="text-secondary">
                {set.actualReps} reps {set.rpe && `• RPE ${set.rpe}`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accessory Work */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-primary" style={{ marginBottom: '24px' }}>
          Accessory Work
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accessoryWork.map((exercise, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                border: '1px solid rgb(55, 55, 53)',
                borderRadius: '6px'
              }}
            >
              <div className="text-accent" style={{ marginBottom: '8px' }}>
                {exercise.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section style={{ marginBottom: '48px' }}>
        <h2 className="text-primary" style={{ marginBottom: '16px' }}>
          Notes
        </h2>
        <textarea
          className="form-input"
          rows={3}
          placeholder="How did the workout feel? Any observations?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
      </section>

      {/* Complete Workout */}
      <section style={{ textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={completeWorkout}
          style={{ width: '100%', padding: '16px', fontSize: '18px' }}
        >
          Complete Workout
        </button>
      </section>
    </div>
  );
};

export default Workout;