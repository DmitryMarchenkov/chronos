import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentDomain, AssessmentType, DomainScore } from '@chronos/shared-types';
import { api } from '../api';

type ScoreRow = {
  id: string;
  domain: AssessmentDomain;
  score: number;
  notes?: string | null;
};

const domainLabels: Record<AssessmentDomain, string> = {
  STRATEGY: 'Strategy',
  PROCESS: 'Process',
  DATA: 'Data',
  TECH: 'Technology',
  PEOPLE: 'People',
  GOVERNANCE: 'Governance',
  SECURITY: 'Security',
};

export const ClientAssessmentPage = () => {
  const { clientId } = useParams();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const domains = useMemo(() => Object.values(AssessmentDomain), []);

  const loadAssessment = async () => {
    if (!clientId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const assessmentList = await api.listAssessments(clientId);
      let activeAssessment = assessmentList.data[0];

      if (!activeAssessment) {
        const created = await api.createAssessment(clientId, AssessmentType.AI_ADOPTION);
        activeAssessment = { id: created.id, type: AssessmentType.AI_ADOPTION };
      }

      setAssessmentId(activeAssessment.id);

      const scoreResponse = await api.getScores(activeAssessment.id);
      const nextScores = domains.map((domain) => {
        const existing = scoreResponse.data.find((item) => item.domain === domain);
        return (
          existing ?? {
            id: domain,
            domain,
            score: 0,
            notes: '',
          }
        );
      });
      setScores(nextScores);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [clientId]);

  const updateScore = (domain: AssessmentDomain, field: 'score' | 'notes', value: string) => {
    setScores((prev) => {
      const exists = prev.find((score) => score.domain === domain);
      if (!exists) {
        return [
          ...prev,
          {
            id: domain,
            domain,
            score: field === 'score' ? Number(value) : 0,
            notes: field === 'notes' ? value : '',
          },
        ];
      }
      return prev.map((score) =>
        score.domain === domain
          ? {
              ...score,
              [field]: field === 'score' ? Number(value) : value,
            }
          : score
      );
    });
  };

  const handleSave = async () => {
    if (!assessmentId) {
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: DomainScore[] = scores.map((score) => ({
      domain: score.domain,
      score: score.score,
      notes: score.notes ?? null,
    }));

    try {
      const response = await api.updateScores(assessmentId, payload);
      setScores(response.data);
      setSuccess('Scores saved');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Assessment</h1>
          <p className="muted">Domain scoring for the selected client.</p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save scores'}
        </button>
      </div>

      {loading ? <div className="card">Loading assessment...</div> : null}
      {error ? <div className="error">{error}</div> : null}
      {success ? <div className="success">{success}</div> : null}

      {!loading ? (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Score (0-5)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => {
                const score = scores.find((item) => item.domain === domain);
                return (
                  <tr key={domain}>
                    <td>{domainLabels[domain]}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={score?.score ?? 0}
                        onChange={(event) => updateScore(domain, 'score', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={score?.notes ?? ''}
                        onChange={(event) => updateScore(domain, 'notes', event.target.value)}
                        placeholder="Add notes"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
