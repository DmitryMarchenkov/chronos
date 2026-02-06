import { Link } from 'react-router-dom';
import logoUrl from '../../assets/chronos-logo.png';

export const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-top">
        <Link to="/" className="home-brand">
          <img src={logoUrl} alt="Chronos" />
          <span>Chronos</span>
        </Link>
        <nav className="home-actions">
          <Link to="/sign-in">Sign in</Link>
          <Link to="/register" className="primary">
            Register
          </Link>
        </nav>
      </header>
      <main className="home-shell">
        <section className="home-hero">
          <img src={logoUrl} alt="Chronos" className="home-logo" />
          <h1>Consulting delivery, made precise.</h1>
          <p>
            Chronos organizes client assessments, domain scoring, and secure
            collaboration for modern delivery teams.
          </p>
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
        </section>
      </main>
    </div>
  );
};
