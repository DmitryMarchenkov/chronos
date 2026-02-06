export const SettingsPage = () => {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Account settings</h1>
          <p className="muted">Enterprise-managed preferences for your account.</p>
        </div>
      </div>

      <div className="card stack">
        <div className="page-header">
          <div>
            <h2>Profile</h2>
            <p className="muted">Managed by your organization directory.</p>
          </div>
          <button type="button" disabled>
            Request update
          </button>
        </div>
        <div className="grid">
          <label>
            Full name
            <input type="text" defaultValue="Casey Adams" disabled />
          </label>
          <label>
            Work email
            <input type="email" defaultValue="casey@chronos.io" disabled />
          </label>
          <label>
            Role
            <input type="text" defaultValue="Consultant" disabled />
          </label>
          <label>
            Team
            <input type="text" defaultValue="Enterprise Delivery" disabled />
          </label>
        </div>
        <p className="muted">
          Profile updates flow from your identity provider and sync automatically.
        </p>
      </div>

      <div className="card stack">
        <div>
          <h2>Notifications</h2>
          <p className="muted">Control how Chronos communicates key updates.</p>
        </div>
        <div className="stack">
          <label className="row">
            <input type="checkbox" defaultChecked disabled />
            <div>
              <div>Weekly executive summary</div>
              <div className="muted">Digest of assessment progress and risks.</div>
            </div>
          </label>
          <label className="row">
            <input type="checkbox" defaultChecked disabled />
            <div>
              <div>Client activity alerts</div>
              <div className="muted">Immediate notifications for score changes.</div>
            </div>
          </label>
          <label className="row">
            <input type="checkbox" disabled />
            <div>
              <div>Monthly stakeholder report</div>
              <div className="muted">Enterprise-ready PDF summary.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="card stack">
        <div className="page-header">
          <div>
            <h2>Security</h2>
            <p className="muted">Enterprise policy controls your access.</p>
          </div>
          <button type="button" disabled>
            Reset password
          </button>
        </div>
        <div className="grid">
          <label>
            Password
            <input type="password" defaultValue="password" disabled />
          </label>
          <label>
            Multi-factor authentication
            <input type="text" defaultValue="Required by policy" disabled />
          </label>
          <label>
            Last credential review
            <input type="text" defaultValue="14 days ago" disabled />
          </label>
          <label>
            Session timeout
            <input type="text" defaultValue="30 minutes" disabled />
          </label>
        </div>
        <p className="muted">Security settings are managed by your admin team.</p>
      </div>
    </div>
  );
};
