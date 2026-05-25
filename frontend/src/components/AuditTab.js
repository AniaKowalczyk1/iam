import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { getActionType } from "../utils/auditColors";
import "./AuditTab.css";

export default function AuditTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    id: "",
    userId: "",
    action: "",
    details: "",
    date: "",
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get("/audit");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredLogs = logs.filter((log) => {
    return (
      String(log.id).includes(filters.id) &&
      String(log.userId).includes(filters.userId) &&
      log.action.toLowerCase().includes(filters.action.toLowerCase()) &&
      log.details.toLowerCase().includes(filters.details.toLowerCase()) &&
      new Date(log.timestamp)
        .toLocaleString()
        .toLowerCase()
        .includes(filters.date.toLowerCase())
    );
  });

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div className="audit-wrapper">
      <h2 className="audit-title">Audit Logs</h2>

      <div className="audit-card">

        {/* DROPDOWN FILTERS */}
        <div className="filters-bar">
          <button
            className="filters-btn"
            onClick={() => setFiltersOpen((prev) => !prev)}
          >
            Filters {filtersOpen ? "▲" : "▼"}
          </button>

          {filtersOpen && (
            <div className="filters-panel">
              <input name="id" placeholder="ID" onChange={handleFilterChange} />
              <input name="userId" placeholder="User" onChange={handleFilterChange} />
              <input name="action" placeholder="Action" onChange={handleFilterChange} />
              <input name="details" placeholder="Details" onChange={handleFilterChange} />
              <input name="date" placeholder="Date" onChange={handleFilterChange} />
            </div>
          )}
        </div>

        {/* TABLE WRAPPER (scroll fix) */}
        <div className="table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => {
                const type = getActionType(log.action);

                return (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.userId}</td>

                    <td>
                      <span className={`badge ${type}`}>
                        {log.action}
                      </span>
                    </td>

                    <td>{log.details}</td>
                    <td>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}