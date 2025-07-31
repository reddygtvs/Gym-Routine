import React, { useState } from 'react';
import { AppState, Exercise, ProgramVariant } from '../types';
import { formatExerciseName, calculateTrainingMax, estimateOneRepMax } from '../utils/531-calculations';

interface SettingsProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  updateTrainingMax: (exercise: Exercise, weight: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ appState, updateAppState, updateTrainingMax }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'training-maxes' | 'program'>('profile');
  const [tempMaxes, setTempMaxes] = useState(appState.user.trainingMaxes);
  const [maxInputs, setMaxInputs] = useState<Record<Exercise, { weight: number; reps: number }>>({
    squat: { weight: 100, reps: 1 },
    bench: { weight: 80, reps: 1 },
    deadlift: { weight: 120, reps: 1 },
    overhead_press: { weight: 60, reps: 1 }
  });

  const exercises: Exercise[] = ['squat', 'bench', 'deadlift', 'overhead_press'];
  
  const programVariants: { key: ProgramVariant; name: string; description: string }[] = [
    { key: 'standard', name: 'Standard 5/3/1', description: 'Original program with basic accessory work' },
    { key: 'boring_but_big', name: 'Boring But Big', description: '5x10 supplemental work for size and strength' },
    { key: 'building_the_monolith', name: 'Building the Monolith', description: 'High-volume program for mass' },
    { key: 'triumvirate', name: 'Triumvirate', description: 'Three exercises per session approach' },
    { key: 'fsl', name: 'First Set Last', description: 'Additional volume with first set percentages' },
    { key: 'joker_sets', name: 'Joker Sets', description: 'Optional heavy singles after main work' }
  ];

  const handleMaxInputChange = (exercise: Exercise, field: 'weight' | 'reps', value: number) => {
    setMaxInputs(prev => ({
      ...prev,
      [exercise]: {
        ...prev[exercise],
        [field]: value
      }
    }));

    // Auto-calculate training max
    const newWeight = field === 'weight' ? value : maxInputs[exercise].weight;
    const newReps = field === 'reps' ? value : maxInputs[exercise].reps;
    const estimatedOneRM = estimateOneRepMax(newWeight, newReps);
    const newTrainingMax = calculateTrainingMax(estimatedOneRM);
    
    setTempMaxes(prev => ({
      ...prev,
      [exercise]: newTrainingMax
    }));
  };

  const saveTrainingMaxes = () => {
    exercises.forEach(exercise => {
      updateTrainingMax(exercise, tempMaxes[exercise]);
    });
  };

  const resetData = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.removeItem('gym-routine-531');
      window.location.reload();
    }
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'training-maxes', label: 'Training Maxes' },
    { key: 'program', label: 'Program' }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1 className="text-primary" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Settings
        </h1>
        <p className="text-secondary">
          Customize your training program and preferences
        </p>
      </header>

      {/* Tab Navigation */}
      <nav style={{ marginBottom: '32px' }}>
        <ul style={{ 
          display: 'flex', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0, 
          gap: '24px',
          borderBottom: '1px solid rgb(55, 55, 53)'
        }}>
          {tabs.map((tab) => (
            <li key={tab.key}>
              <button
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.key ? '2px solid rgb(100, 100, 98)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'rgb(253, 253, 252)' : 'rgb(161, 161, 159)',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Profile Information
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Name
              </label>
              <input
                type="text"
                className="form-input"
                value={appState.user.name || ''}
                onChange={(e) => updateAppState({
                  user: { ...appState.user, name: e.target.value || undefined }
                })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Units
              </label>
              <select
                className="form-input"
                value={appState.user.units}
                onChange={(e) => updateAppState({
                  user: { ...appState.user, units: e.target.value as 'kg' | 'lbs' }
                })}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Bodyweight ({appState.user.units})
              </label>
              <input
                type="number"
                className="form-input"
                value={appState.user.bodyweight || ''}
                onChange={(e) => updateAppState({
                  user: { ...appState.user, bodyweight: e.target.value ? Number(e.target.value) : undefined }
                })}
                placeholder="Enter your bodyweight"
              />
            </div>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'rgb(24, 24, 23)',
            border: '1px solid rgb(55, 55, 53)',
            borderRadius: '6px',
            marginTop: '24px'
          }}>
            <div className="text-secondary" style={{ marginBottom: '8px' }}>
              Training Started: {appState.user.startDate.toLocaleDateString()}
            </div>
            <div className="text-secondary">
              Current Cycle: {appState.user.currentCycle}
            </div>
          </div>
        </section>
      )}

      {/* Training Maxes Tab */}
      {activeTab === 'training-maxes' && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Training Maxes
          </h2>
          <p className="text-secondary" style={{ marginBottom: '32px' }}>
            Enter your current max weight and reps to calculate new training maxes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {exercises.map((exercise) => (
              <div key={exercise} style={{
                padding: '24px',
                border: '1px solid rgb(55, 55, 53)',
                borderRadius: '8px'
              }}>
                <h3 className="text-accent" style={{ marginBottom: '16px' }}>
                  {formatExerciseName(exercise)}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                  <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                      Max Weight ({appState.user.units})
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxInputs[exercise].weight}
                      onChange={(e) => handleMaxInputChange(exercise, 'weight', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                      Reps
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="20"
                      value={maxInputs[exercise].reps}
                      onChange={(e) => handleMaxInputChange(exercise, 'reps', Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                      New Training Max
                    </label>
                    <div className="text-primary" style={{
                      padding: '12px',
                      border: '1px solid rgb(55, 55, 53)',
                      borderRadius: '6px',
                      backgroundColor: 'rgb(26, 26, 24)'
                    }}>
                      {tempMaxes[exercise]}{appState.user.units}
                    </div>
                  </div>
                </div>

                <div className="text-secondary" style={{ marginTop: '12px', fontSize: '14px' }}>
                  Current TM: {appState.user.trainingMaxes[exercise]}{appState.user.units} → 
                  Est. 1RM: {estimateOneRepMax(maxInputs[exercise].weight, maxInputs[exercise].reps)}{appState.user.units}
                </div>
              </div>
            ))}

            <button
              className="btn btn-primary"
              onClick={saveTrainingMaxes}
              style={{ alignSelf: 'flex-start' }}
            >
              Update Training Maxes
            </button>
          </div>
        </section>
      )}

      {/* Program Tab */}
      {activeTab === 'program' && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Program Settings  
          </h2>
          <p className="text-secondary" style={{ marginBottom: '32px' }}>
            Choose your preferred 5/3/1 program variant.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {programVariants.map((variant) => (
              <div
                key={variant.key}
                onClick={() => updateAppState({
                  user: { ...appState.user, preferredVariant: variant.key }
                })}
                style={{
                  padding: '20px',
                  border: appState.user.preferredVariant === variant.key 
                    ? '2px solid rgb(100, 100, 98)' 
                    : '1px solid rgb(55, 55, 53)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: appState.user.preferredVariant === variant.key 
                    ? 'rgba(100, 100, 98, 0.1)' 
                    : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="text-accent" style={{ marginRight: '12px' }}>
                    {appState.user.preferredVariant === variant.key ? '●' : '○'}
                  </div>
                  <h3 className="text-primary" style={{ margin: 0 }}>
                    {variant.name}
                  </h3>
                  {appState.user.preferredVariant === variant.key && (
                    <span className="text-accent" style={{ marginLeft: 'auto' }}>✓</span>
                  )}
                </div>
                <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>
                  {variant.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ 
            padding: '16px', 
            backgroundColor: 'rgb(40, 20, 20)', 
            border: '1px solid rgb(80, 40, 40)', 
            borderRadius: '6px' 
          }}>
            <h3 className="text-primary" style={{ marginBottom: '8px' }}>
              Danger Zone
            </h3>
            <p className="text-secondary" style={{ marginBottom: '16px', fontSize: '14px' }}>
              This will permanently delete all your workout data and reset the app to its initial state.
            </p>
            <button
              className="btn"
              onClick={resetData}
              style={{ 
                backgroundColor: 'rgb(127, 29, 29)', 
                color: 'rgb(253, 253, 252)' 
              }}
            >
              Reset All Data
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Settings;