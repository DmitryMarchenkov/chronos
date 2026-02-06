export const SettingsPage = () => {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Account settings</h1>
          <p className="muted">Manage your profile, notifications, and security.</p>
        </div>
      </div>

      <div className="card">
        <h2>Profile</h2>
        <p className="muted">Profile editing is coming soon.</p>
        <div className="stack">
          <div>
            <div className="muted">Name</div>
            <div>Casey Adams</div>
          </div>
          <div>
            <div className="muted">Email</div>
            <div>casey@chronos.io</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Notifications</h2>
        <p className="muted">Notification preferences are coming soon.</p>
        <div className="stack">
          <div>
            <div className="muted">Assessment updates</div>
            <div>Email summaries weekly</div>
          </div>
          <div>
            <div className="muted">Client activity</div>
            <div>Instant alerts</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Security</h2>
        <p className="muted">Security controls are coming soon.</p>
        <div className="stack">
          <div>
            <div className="muted">Password</div>
            <div>Last updated 45 days ago</div>
          </div>
          <div>
            <div className="muted">Multi-factor authentication</div>
            <div>Not enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
};
