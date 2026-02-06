import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './auth';
import { AppLayout } from './layout';
import { SignInPage } from './pages/sign-in';
import { RegisterPage } from './pages/register';
import { HomePage } from './pages/home';
import { DashboardPage } from './pages/dashboard';
import { ClientAssessmentPage } from './pages/client-assessment';
import { SettingsPage } from './pages/settings';

const ProtectedLayout = () => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }
  return <AppLayout />;
};

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients/:clientId/assessment" element={<ClientAssessmentPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
