import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../auth';
import logoUrl from '../../assets/chronos-logo.png';

export const HomePage = () => {
  const navigate = useNavigate();
  const token = getToken();

  const handleSignOut = () => {
    clearToken();
    navigate('/sign-in');
  };

  return (
    <div className="home-page">
      <header className="home-top">
        <Link to="/" className="home-brand">
          <img src={logoUrl} alt="Chronos" />
          <span>Chronos</span>
        </Link>
        {token ? (
          <details className="account-menu">
            <summary>
              <span className="account-avatar">CA</span>
              <span>My account</span>
            </summary>
            <div className="menu">
              <Link to="/notifications">Notifications</Link>
              <Link to="/settings">Settings</Link>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </details>
        ) : (
          <nav className="home-actions">
            <Link to="/sign-in">Sign in</Link>
            <Link to="/register" className="primary">
              Register
            </Link>
          </nav>
        )}
      </header>
      <main className="home-shell">
        <section className="home-hero">
          <img src={logoUrl} alt="Chronos" className="home-logo" />
          <h1>Consulting delivery, made precise.</h1>
          <p>
            Chronos organizes client assessments, domain scoring, and secure
            collaboration for modern delivery teams.
          </p>
        </section>
        <section className="home-sections">
          <div className="home-section">
            <div>
              <h2>Delivery clarity at scale</h2>
              <p className="muted">
                Align on client outcomes with a trusted workspace that keeps every team,
                score, and action visible.
              </p>
            </div>
            <div className="home-metadata">
              <div>
                <span className="meta-label">Security</span>
                <span>Tenant-scoped access</span>
              </div>
              <div>
                <span className="meta-label">Assessments</span>
                <span>AI adoption + transformation</span>
              </div>
              <div>
                <span className="meta-label">Collaboration</span>
                <span>Role-based permissions</span>
              </div>
            </div>
          </div>
          <div className="home-section home-cta">
            <div>
              <h2>Build a workspace that scales</h2>
              <p className="muted">
                Launch a new client program in minutes, then keep delivery signals
                consistent across the portfolio.
              </p>
            </div>
            <div className="row">
              <Link to="/register" className="primary">
                Start workspace
              </Link>
              <Link className="ghost-link" to="/sign-in">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
