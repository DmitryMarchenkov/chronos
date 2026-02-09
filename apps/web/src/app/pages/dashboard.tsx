import { useEffect, useState, type SubmitEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

type Client = { id: string; name: string; createdAt: string };

export const DashboardPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listClients();
      setClients(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const createClient: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await api.createClient(name.trim());
      setName('');
      await loadClients();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="muted">Your active delivery workspaces.</p>
        </div>
        <form onSubmit={createClient} className="row">
          <input
            type="text"
            placeholder="New client name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button type="submit" disabled={creating}>
            Add client
          </button>
        </form>
      </div>

      {loading ? <div className="card">Loading clients...</div> : null}
      {error ? <div className="error">{error}</div> : null}

      {!loading && clients.length === 0 ? (
        <div className="card empty">No clients yet. Create your first client.</div>
      ) : null}

      <div className="grid">
        {clients.map((client) => (
          <Link key={client.id} to={`/clients/${client.id}/assessment`} className="card">
            <h3>{client.name}</h3>
            <span className="muted">Created {new Date(client.createdAt).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
