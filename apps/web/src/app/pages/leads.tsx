import { useEffect, useState, type ChangeEvent, type SubmitEventHandler } from 'react';
import { LeadStatus, LeadSummary } from '@chronos/shared-types';
import { api } from '../api';

const statusLabels: Record<LeadStatus, string> = {
  NEW: 'New',
  PROSPECTING: 'Prospecting',
  CONVERTED: 'Converted',
};

export const LeadsPage = () => {
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, LeadStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    source: '',
  });

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listLeads();
      setLeads(response.data);
      setStatusDrafts(
        response.data.reduce<Record<string, LeadStatus>>((acc, lead) => {
          acc[lead.id] = lead.status;
          return acc;
        }, {})
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const createLead: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.source.trim()) {
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      await api.createLead(form.name.trim(), form.contact.trim(), form.source.trim());
      setForm({ name: '', contact: '', source: '' });
      setSuccess('Lead created');
      await loadLeads();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (leadId: string) => {
    setError(null);
    setSuccess(null);
    try {
      await api.updateLeadStatus(leadId, statusDrafts[leadId]);
      setSuccess('Lead status updated');
      await loadLeads();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const convertLead = async (leadId: string) => {
    setConvertingLeadId(leadId);
    setError(null);
    setSuccess(null);
    try {
      await api.convertLead(leadId);
      setSuccess('Lead converted to client');
      await loadLeads();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConvertingLeadId(null);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p className="muted">Track potential clients before they become active workspaces.</p>
        </div>
      </div>

      <div className="card stack">
        <h2>Create lead</h2>
        <p className="muted">Capture lead details for qualification and conversion planning.</p>
        <form onSubmit={createLead} className="row">
          <input
            type="text"
            placeholder="Lead name"
            value={form.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Contact"
            value={form.contact}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, contact: event.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Source"
            value={form.source}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, source: event.target.value }))
            }
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create lead'}
          </button>
        </form>
      </div>

      {loading ? <div className="card">Loading leads...</div> : null}
      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="success">{success}</div> : null}

      {!loading && leads.length === 0 ? (
        <div className="card empty">No leads yet. Create your first lead.</div>
      ) : null}

      {!loading && leads.length > 0 ? (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.contact}</td>
                  <td>{lead.source}</td>
                  <td>
                    <div className="row">
                      <select
                        value={statusDrafts[lead.id] ?? lead.status}
                        onChange={(event) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [lead.id]: event.target.value as LeadStatus,
                          }))
                        }
                      >
                        {Object.values(LeadStatus).map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => updateStatus(lead.id)}>
                        Update
                      </button>
                    </div>
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      disabled={lead.status === LeadStatus.CONVERTED || convertingLeadId === lead.id}
                      onClick={() => convertLead(lead.id)}
                    >
                      {convertingLeadId === lead.id ? 'Converting...' : 'Convert lead'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
