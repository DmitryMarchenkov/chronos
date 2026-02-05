import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './auth';
import { AppLayout } from './layout';
import { SignInPage } from './pages/sign-in';
import { DashboardPage } from './pages/dashboard';
import { ClientAssessmentPage } from './pages/client-assessment';

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
      <Route path="/sign-in" element={<SignInPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients/:clientId/assessment" element={<ClientAssessmentPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
