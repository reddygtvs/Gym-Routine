import React, { useState } from 'react';
import { UserProfile, Exercise, ProgramVariant } from '../types';
import { calculateTrainingMax, estimateOneRepMax, formatExerciseName } from '../utils/531-calculations';

interface SetupProps {
  onComplete: (profile: UserProfile) => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    units: 'kg' as 'kg' | 'lbs',
    bodyweight: '',
    maxes: {
      squat: { weight: '100', reps: '1' },
      bench: { weight: '80', reps: '1' },
      deadlift: { weight: '120', reps: '1' },
      overhead_press: { weight: '60', reps: '1' }
    },
    variant: 'standard' as ProgramVariant
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

  const calculateEstimatedMax = (exercise: Exercise) => {
    const { weight, reps } = formData.maxes[exercise];
    if (!weight || !reps) return { oneRM: 0, trainingMax: 0 };
    
    const oneRM = estimateOneRepMax(Number(weight), Number(reps));
    const trainingMax = calculateTrainingMax(oneRM);
    return { oneRM, trainingMax };
  };

  const handleComplete = () => {
    const trainingMaxes: Record<Exercise, number> = {} as Record<Exercise, number>;
    
    exercises.forEach(exercise => {
      const { trainingMax } = calculateEstimatedMax(exercise);
      trainingMaxes[exercise] = trainingMax;
    });

    const profile: UserProfile = {
      name: formData.name || undefined,
      startDate: new Date(),
      currentCycle: 1,
      trainingMaxes,
      preferredVariant: formData.variant,
      accessoryPreferences: [],
      units: formData.units,
      bodyweight: formData.bodyweight ? Number(formData.bodyweight) : undefined
    };

    onComplete(profile);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="text-primary" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Welcome to 5/3/1
        </h1>
        <p className="text-secondary">
          Let's set up your personalized strength training program
        </p>
      </header>

      {/* Progress Indicator */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: step <= currentStep ? 'rgb(100, 100, 98)' : 'rgb(55, 55, 53)'
              }}
            />
          ))}
        </div>
        <div className="text-secondary" style={{ textAlign: 'center', fontSize: '14px' }}>
          Step {currentStep} of 3
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Basic Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Name (optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Units
              </label>
              <select
                className="form-input"
                value={formData.units}
                onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value as 'kg' | 'lbs' }))}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                Bodyweight (optional)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder="Enter your bodyweight"
                value={formData.bodyweight}
                onChange={(e) => setFormData(prev => ({ ...prev, bodyweight: e.target.value }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Current Maxes */}
      {currentStep === 2 && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Current Maxes
          </h2>
          <p className="text-secondary" style={{ marginBottom: '32px' }}>
            Enter your current max weight and reps for each exercise. We'll calculate your training maxes automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {exercises.map((exercise) => {
              const { oneRM, trainingMax } = calculateEstimatedMax(exercise);
              
              return (
                <div key={exercise} style={{
                  padding: '24px',
                  border: '1px solid rgb(55, 55, 53)',
                  borderRadius: '8px'
                }}>
                  <h3 className="text-accent" style={{ marginBottom: '16px' }}>
                    {formatExerciseName(exercise)}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="text-secondary" style={{ display: 'block', marginBottom: '8px' }}>
                        Weight ({formData.units})
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={formData.maxes[exercise].weight}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          maxes: {
                            ...prev.maxes,
                            [exercise]: {
                              ...prev.maxes[exercise],
                              weight: e.target.value
                            }
                          }
                        }))}
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
                        value={formData.maxes[exercise].reps}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          maxes: {
                            ...prev.maxes,
                            [exercise]: {
                              ...prev.maxes[exercise],
                              reps: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>

                  {oneRM > 0 && (
                    <div className="text-secondary" style={{ fontSize: '14px' }}>
                      Estimated 1RM: {oneRM}{formData.units} → Training Max: {trainingMax}{formData.units}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 3: Choose Program */}
      {currentStep === 3 && (
        <section>
          <h2 className="text-primary" style={{ marginBottom: '24px' }}>
            Choose Your Program
          </h2>
          <p className="text-secondary" style={{ marginBottom: '32px' }}>
            Select the 5/3/1 variant that best fits your goals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {programVariants.map((variant) => (
              <div
                key={variant.key}
                onClick={() => setFormData(prev => ({ ...prev, variant: variant.key }))}
                style={{
                  padding: '20px',
                  border: formData.variant === variant.key 
                    ? '2px solid rgb(100, 100, 98)' 
                    : '1px solid rgb(55, 55, 53)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: formData.variant === variant.key 
                    ? 'rgba(100, 100, 98, 0.1)' 
                    : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="text-accent" style={{ marginRight: '12px' }}>
                    {formData.variant === variant.key ? '●' : '○'}
                  </div>
                  <h3 className="text-primary" style={{ margin: 0 }}>
                    {variant.name}
                  </h3>
                </div>
                <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>
                  {variant.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Back
        </button>
        
        {currentStep < 3 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentStep(prev => prev + 1)}
          >
            Continue
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleComplete}
          >
            Start Training
          </button>
        )}
      </div>
    </div>
  );
};

export default Setup;