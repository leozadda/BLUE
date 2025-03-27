import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/landing-page/LandingPage";
import SignUp from './pages/auth/sign-up/SignUp';
import Login from './pages/auth/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import WorkoutAnalytics from './pages/dashboard/components/analytics/WorkoutAnalytics';
import Split from './pages/dashboard/components/split/Split';
import CustomerService from './pages/customer-service/CustomerService';
import PrivacyPolicy from './pages/privacy-policy/PrivacyPolicy';
import TermsOfService from './pages/terms-of-service/TermsOfService';
import { Settings } from './pages/dashboard/components/settings/Settings';
import Lift from './pages/dashboard/components/log-workout/LogWorkout';
import Measurements from './pages/dashboard/components/measurements/Measurements';
import Coach from './pages/dashboard/components/coach/Coach';
import Payment from './pages/payment/Payment';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/help" element={<CustomerService />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Settings />} />
          <Route path="analytics" element={<WorkoutAnalytics />} />
          <Route path="lift" element={<Lift />} />
          <Route path="split" element={<Split/>} />
          <Route path="measure" element={<Measurements />} />
          <Route path="coach" element={<Coach />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;