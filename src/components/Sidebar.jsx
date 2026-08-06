import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({ conversations, activeId, onSelect, onNewChat }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <p className="eyebrow">Marginal</p>
        <h2 className="sidebar-title">Entries</h2>
      </div>

      <button className="btn-new-entry" onClick={onNewChat}>
        + New entry
      </button>

      <nav className="entry-list">
        {conversations.length === 0 && (
          <p className="entry-empty">No entries yet — start your first one above.</p>
        )}
        {conversations.map((c, i) => (
          <button
            key={c._id}
            className={`entry-item ${c._id === activeId ? "entry-item-active" : ""}`}
            onClick={() => onSelect(c._id)}
          >
            <span className="entry-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="entry-name">{c.title || "Untitled entry"}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-chip">
          <span className="user-initial">{user?.name?.[0]?.toUpperCase() || "?"}</span>
          <span className="user-name">{user?.name}</span>
        </div>
        <button className="btn-signout" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
