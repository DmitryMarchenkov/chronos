import { FormEvent, MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { setToken } from '../auth';

export const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (
    event: FormEvent | MouseEvent<HTMLButtonElement>,
    mode: 'login' | 'register'
  ) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register(email, password);
      setToken(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="muted">Chronos B2B delivery platform</p>
        <form className="stack" onSubmit={(event) => submit(event, 'login')}>
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
              Sign in
            </button>
            <button
              type="button"
              className="ghost"
              onClick={(event) => submit(event, 'register')}
              disabled={busy}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
