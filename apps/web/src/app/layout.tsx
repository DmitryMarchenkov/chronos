import { useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from './auth';
import logoUrl from '../assets/chronos-logo.png';

export const AppLayout = () => {
  const navigate = useNavigate();
  const accountMenuRef = useRef<HTMLDetailsElement | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (accountMenuRef.current) {
      accountMenuRef.current.open = false;
    }
  };

  const handleSignOut = () => {
    clearToken();
    handleNavigate('/sign-in');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand brand-link">
          <img src={logoUrl} alt="Chronos" />
          <span>Chronos</span>
        </Link>
        <nav>
          <Link to="/leads">Leads</Link>
          <Link to="/dashboard">Clients</Link>
        </nav>
      </aside>
      <main className="content">
        <header className="app-topbar">
          <div className="app-topbar-title">Dashboard</div>
          <details className="account-menu" ref={accountMenuRef}>
            <summary>
              <span className="account-avatar">CA</span>
              <span>My account</span>
            </summary>
            <div className="menu">
              <button type="button">Profile (coming soon)</button>
              <button type="button" onClick={() => handleNavigate('/notifications')}>
                Notifications
              </button>
              <button type="button" onClick={() => handleNavigate('/settings')}>
                Settings
              </button>
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
