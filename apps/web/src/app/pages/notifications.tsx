export const NotificationsPage = () => {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Delivery alerts and activity updates for your workspace.</p>
        </div>
      </div>

      <div className="card stack">
        <div>
          <h2>Notification preferences</h2>
          <p className="muted">Customize how Chronos communicates key events.</p>
        </div>
        <div className="stack">
          <label className="row">
            <input type="checkbox" defaultChecked disabled />
            <div>
              <div>Weekly executive summary</div>
              <div className="muted">Portfolio-level digest every Monday.</div>
            </div>
          </label>
          <label className="row">
            <input type="checkbox" defaultChecked disabled />
            <div>
              <div>Client activity alerts</div>
              <div className="muted">Immediate updates for score changes.</div>
            </div>
          </label>
          <label className="row">
            <input type="checkbox" disabled />
            <div>
              <div>Stakeholder report</div>
              <div className="muted">Monthly PDF summary for leadership.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Recent notifications</h2>
        <p className="muted">No notifications yet. Activity will appear here.</p>
      </div>
    </div>
  );
};
