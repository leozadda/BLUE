import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from "./pages/landing-page/LandingPage";
import SignUp from './pages/auth/sign-up/SignUp';
import Login from './pages/auth/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import WorkoutAnalytics from './pages/dashboard/components/analytics/WorkoutAnalytics';
import Split from './pages/dashboard/components/split/Split';
import CustomerService from './pages/customer-service/CustomerService';
import PrivacyPolicy from './pages/privacy-policy/PrivacyPolicy';
import TermsOfService from './pages/terms-of-service/TermsOfService';
import { Settings } from './pages/dashboard/components/settings/v1/Settings';
import Lift from './pages/dashboard/components/log-workout/LogWorkout';
import Measurements from './pages/dashboard/components/measurements/Measurements';
import Payment from './pages/payment/Payment';
import { AuthProvider, useAuth } from './pages/auth/auth-context/AuthContext';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// PrivateRoute: Protects dashboard routes.
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, authChecked } = useAuth();
  
  // Wait until authentication check is complete before making any decision
  if (isLoading || !authChecked) {
    return (
      <div className="Loading-Screen">
        <div style={{ backgroundColor: 'blue' }}>
        </div>
      </div>
    );
  }
  
  // Once the auth check is done, if the user is authenticated, show the protected content
  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" />;
}

// PaymentRoute: Special protected route that checks both authentication and trial status
// Only allows access if user is authenticated AND their trial has expired
function PaymentRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, authChecked, userInfo } = useAuth();

  if (isLoading || !authChecked) {
    return (
      <div className="Loading-Screen">
        <div style={{ backgroundColor: 'blue' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const now = new Date();
  const trialEndDate = userInfo?.trial_period_ends_at ? new Date(userInfo.trial_period_ends_at) : null;
  const trialExpired = trialEndDate && now > trialEndDate;
  const needsPayment = userInfo?.premiumStatus !== true; // Assuming `premiumStatus` is a boolean

  if (trialExpired && needsPayment) {
    return children;
  }

  return <Navigate to="/dashboard/settings" />;
}


// AuthRedirect: Used on login/signup pages to redirect already-authenticated users to dashboard.
function AuthRedirect({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, authChecked } = useAuth();

  // Wait until authentication check is complete before making any decision
  if (isLoading || !authChecked) {
    // Return a loading indicator instead of redirecting
    return (
      <div className="Loading-Screen">
        <div style={{ backgroundColor: 'blue' }}>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard/settings" />;
  }

  return children;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/help" element={<CustomerService />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Protected payment route - only accessible when authenticated AND trial expired */}
            <Route path="/payment" element={
              <PaymentRoute>
                <Payment />
              </PaymentRoute>
            } />
            
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            <Route path="/signup" element={
              <AuthRedirect>
                <SignUp />
              </AuthRedirect>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }>
              {/* This new index route will redirect users from /dashboard to /dashboard/settings */}
              <Route index element={
                (() => {
                  return <Navigate to="/dashboard/settings" replace />;
                })()
              } />
              
              {/* Nested routes remain unchanged */}
              <Route path="analytics" element={<WorkoutAnalytics />} />
              <Route path="lift" element={<Lift />} />
              <Route path="split" element={<Split/>} />
              <Route path="measure" element={<Measurements />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;