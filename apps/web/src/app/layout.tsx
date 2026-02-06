import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from './auth';
import logoUrl from '../assets/chronos-logo.png';

export const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearToken();
    navigate('/sign-in');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand brand-link">
          <img src={logoUrl} alt="Chronos" />
          <span>Chronos</span>
        </Link>
        <nav>
          <Link to="/dashboard">Clients</Link>
        </nav>
      </aside>
      <main className="content">
        <header className="app-topbar">
          <div className="app-topbar-title">Dashboard</div>
          <details className="account-menu">
            <summary>
              <span className="account-avatar">CA</span>
              <span>My account</span>
            </summary>
            <div className="menu">
              <button type="button">Profile (coming soon)</button>
              <button type="button">Team settings (coming soon)</button>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </details>
        </header>
        <Outlet />
      </main>
    </div>
  );
};
