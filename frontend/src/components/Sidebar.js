import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  user
}) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  const displayName = fullName || user?.email || "Użytkownik";

  return (
    <div className="sidebar">

      <div className="sidebar-user">
        <div className="sidebar-user-label">Zalogowano jako</div>
        <div className="sidebar-user-name">{displayName}</div>
      </div>

      <button
        className="sidebar-button logout"
        onClick={logout}
      >
        Wyloguj
      </button>

      <div className="sidebar-top">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={
              activeTab === tab.key
                ? "sidebar-button active"
                : "sidebar-button"
            }
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

    </div>
  );
}