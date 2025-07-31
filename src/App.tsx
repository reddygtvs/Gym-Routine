import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, UserProfile, Exercise } from './types';
import Header from './components/Header';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Workout from './components/Workout';
import Progress from './components/Progress';
import Settings from './components/Settings';

// Default user profile
const defaultUser: UserProfile = {
  startDate: new Date(),
  currentCycle: 1,
  trainingMaxes: {
    squat: 100,
    bench: 80,
    deadlift: 120,
    overhead_press: 60
  },
  preferredVariant: 'standard',
  accessoryPreferences: [],
  units: 'kg'
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    user: defaultUser,
    cycles: [],
    workouts: [],
    progress: [],
  });

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('gym-routine-531');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAppState({
          ...parsed,
          user: {
            ...parsed.user,
            startDate: new Date(parsed.user.startDate)
          }
        });
        setIsSetupComplete(true);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever appState changes
  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem('gym-routine-531', JSON.stringify(appState));
    }
  }, [appState, isSetupComplete]);

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const updateTrainingMax = (exercise: Exercise, weight: number) => {
    setAppState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        trainingMaxes: {
          ...prev.user.trainingMaxes,
          [exercise]: weight
        }
      }
    }));
  };

  if (!isSetupComplete) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "rgb(17, 17, 16)" }}>
        <div className="container-content">
          <Setup 
            onComplete={(userProfile) => {
              setAppState(prev => ({ ...prev, user: userProfile }));
              setIsSetupComplete(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(17, 17, 16)" }}>
      <Router>
        <Header user={appState.user} />
        <main className="container-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  appState={appState} 
                  updateAppState={updateAppState}
                />
              } 
            />
            <Route 
              path="/workout/:exercise/:week" 
              element={
                <Workout 
                  appState={appState} 
                  updateAppState={updateAppState}
                />
              } 
            />
            <Route 
              path="/progress" 
              element={
                <Progress 
                  appState={appState}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Settings 
                  appState={appState}
                  updateAppState={updateAppState}
                  updateTrainingMax={updateTrainingMax}
                />
              } 
            />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;