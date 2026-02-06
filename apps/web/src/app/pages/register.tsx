import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { setToken } from '../auth';
import logoUrl from '../../assets/chronos-logo.png';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await api.register(email, password);
      setToken(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page auth-form-page">
      <section className="auth-card">
        <Link to="/" className="auth-logo-link">
          <img src={logoUrl} alt="Chronos" />
        </Link>
        <div>
          <h2>Create your account</h2>
          <p className="muted">Register a new workspace owner account.</p>
        </div>
        <form className="stack" onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <div className="row">
            <button type="submit" disabled={busy}>
              Create account
            </button>
            <Link className="ghost-link" to="/sign-in">
              Back to sign in
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
