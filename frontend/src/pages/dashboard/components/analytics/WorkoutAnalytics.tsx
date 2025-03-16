import React, { Suspense, lazy, useState, useEffect } from 'react';
import './WorkoutAnalytics.css';
import { ResponsiveContainer } from 'recharts';
import { Ellipsis } from 'lucide-react';
import { authFetch } from '../../../auth/token/authFetch';
import { useAuth } from '../../../auth/auth-context/AuthContext';

// Lazy load graph components for better performance
const BodyWeightGraph = lazy(() => import('./graphs/line-graph/body-weight/BodyWeightGraph'));
const StrengthProgress = lazy(() => import('./graphs/line-graph/strength-progress/StrengthProgress'));
const MuscleVolume = lazy(() => import('./graphs/line-graph/muscle-volume/MuscleVolume'));
const MuscleRecovery = lazy(() => import('./graphs/bar-graph/muscle-recovery/MuscleRecovery'));
const PersonalRecords = lazy(() => import('./graphs/scatter-chart/personal-records/PersonalRecords'));
const MuscleSize = lazy(() => import('./graphs/line-graph/muscle-size/MuscleSize'));

// Loading placeholder component
const GraphLoader = () => (
  <div className="graph-loading">
  </div>
);

// Error boundary component for graph errors
class GraphErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="graph-error">
          <p>Error. Refresh please.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main analytics component
const WorkoutAnalytics: React.FC = () => {
  // State for metric system preference
  const [isMetricSystem, setIsMetricSystem] = useState<boolean | null>(null);
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State for error handling
  const [error, setError] = useState<string | null>(null);

  const { userInfo, userInfoLoading, refreshUserInfo } = useAuth();

    // Fetch the user's unit preference (metric or imperial) from the user info
    useEffect(() => {
     
      
      // Set the metricSystem state based on the user's preference
      if(userInfo) {
        setIsMetricSystem(userInfo.metric_system);
      }
  }, [userInfo]); // This effect runs whenever userInfo changes

  // Array of graph configurations for easier management
  const graphs = [
    { id: 'body-weight', Component: BodyWeightGraph, className: 'Body-Weight-Graph' },
    { id: 'strength-progress', Component: StrengthProgress, className: 'Strength-Progress-Graph' },
    { id: 'muscle-volume', Component: MuscleVolume, className: 'Muscle-Volume-Graph' },
    { id: 'muscle-recovery', Component: MuscleRecovery, className: 'Muscle-Recovery-Graph' },
    { id: 'personal-records', Component: PersonalRecords, className: 'Personal-Records-Graph' },
    { id: 'muscle-size', Component: MuscleSize, className: 'Muscle-Size-Graph' }
  ];

  // Show loading state while fetching user data
  if (isLoading) {
   
  }

  // Show error message if there was an error
  if (error) {
   
    return <div className="Workout-Analytics">{error}</div>;
  }

  return (
    <div className="Workout-Analytics">
      <div className="Graphs">
        {graphs.map(({ id, Component, className }) => (
          <div key={id} className={className}>
            <GraphErrorBoundary>
              <Suspense fallback={<GraphLoader />}>
                {/* Pass isMetricSystem to each graph component */}
                <Component isMetricSystem={isMetricSystem} />
              </Suspense>
            </GraphErrorBoundary>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutAnalytics;

/*
const MuscleGrowth = lazy(() => import('./graphs/line-graph/estimated-muscle-growth/EstimatedMuscleGrowth'));
const MissedDays = lazy(() => import('./graphs/line-graph/missed-days/MissedDays'));
const RestTimes = lazy(() => import('./graphs/bar-graph/rest-times/RestTimes'));
const GymTimeSpent = lazy(() => import('./graphs/bar-graph/gym-time-spent/GymTimeSpent'));


{ id: 'muscle-growth', Component: MuscleGrowth, className: 'Muscle-Growth-Graph' },
{ id: 'missed-days', Component: MissedDays, className: 'Missed-Days-Graph' },
{ id: 'rest-times', Component: RestTimes, className: 'Rest-Times-Graph' },
{ id: 'gym-time', Component: GymTimeSpent, className: 'Gym-Time-Graph' },

*/