import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from './auth';

export const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearToken();
    navigate('/sign-in');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Chronos</div>
        <nav>
          <Link to="/dashboard">Clients</Link>
        </nav>
        <button type="button" onClick={handleSignOut} className="ghost">
          Sign out
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};
