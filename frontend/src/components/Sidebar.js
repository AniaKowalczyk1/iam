import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab
}) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">


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