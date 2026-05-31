import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { usePermissions } from "../hooks/usePermissions";
import "./DepartmentsTab.css";

export default function DepartmentsTab() {
  const { hasPermission, loading: permissionLoading } = usePermissions();

  const [departments, setDepartments] = useState([]);
  const [myDepartments, setMyDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [assignError, setAssignError] = useState("");

  const canManageUsers = hasPermission(
    "ASSIGN_REMOVE_USER_TO_FROM_DEPARTMENT"
  );

  const canEditDepartments = hasPermission("CREATE_DEPARTMENT");

  // ===== MODALS =====
  const [assignModal, setAssignModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(null);

  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDepartment = (id) => {
    setExpandedDepartments((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data || []);
  };

  const loadMyDepartments = async () => {
    const res = await api.get("/departments/view");
    setMyDepartments(res.data || []);
  };

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data || []);
  };

  const reloadAll = async () => {
    if (hasPermission("VIEW_DEPARTMENTS")) await loadDepartments();
    if (hasPermission("VIEW_DEPARTMENT")) await loadMyDepartments();
  };

  useEffect(() => {
    if (permissionLoading) return;

    if (hasPermission("VIEW_DEPARTMENTS")) loadDepartments();
    if (hasPermission("VIEW_DEPARTMENT")) loadMyDepartments();
    if (canManageUsers) loadUsers();
  }, [permissionLoading]);

  const createDepartment = async () => {
    if (!name.trim()) return;

    await api.post("/departments", { name });

    setName("");
    await loadDepartments();
  };

  const openEditModal = (department) => {
    setEditModal(department);
    setEditName(department.name);
    setEditError("");
  };

  const confirmEditDepartment = async () => {
    if (!editModal || !editName.trim()) return;

    setLoading(true);

    try {
      await api.put(`/departments/${editModal.id}`, {
        name: editName,
      });

      setEditModal(null);
      setEditName("");
      setEditError("");
      await reloadAll();
    } catch (error) {
      if (error.response?.status === 409) {
        setEditError("Dział o takiej nazwie już istnieje");
      } else {
        setEditError("Nie udało się zmienić nazwy działu");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmAssignUser = async () => {
    if (!assignModal || !selectedUserId) return;

    setLoading(true);

    try {
      await api.post("/departments/assign", null, {
        params: {
          userId: selectedUserId,
          departmentId: assignModal.deptId,
        },
      });

      setAssignModal(null);
      setSelectedUserId("");
      setAssignError("");
      await reloadAll();
    } catch (error) {
      setAssignError("Użytkownik jest już w tym dziale");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = (deptId, userId) => {
    setDeleteConfirm({ deptId, userId });
  };

  const confirmRemoveUser = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete("/departments/remove", {
        params: {
          userId: deleteConfirm.userId,
          departmentId: deleteConfirm.deptId,
        },
      });

      setDeleteConfirm(null);
      await reloadAll();
    } catch {
      alert("Błąd usuwania użytkownika");
    }
  };

  const confirmRemoveAllUsers = async () => {
    if (!deleteAllConfirm) return;

    try {
      await api.delete("/departments/remove-all", {
        params: {
          departmentId: deleteAllConfirm.deptId,
        },
      });

      setDeleteAllConfirm(null);
      await reloadAll();
    } catch {
      alert("Błąd usuwania użytkowników");
    }
  };

  const getDeptName = (id) =>
    departments.find((d) => d.id === id)?.name || "Nieznany";

  if (permissionLoading) return <p>Ładowanie...</p>;

  return (
    <div className="dept-wrapper">
      <h2 className="dept-title">Działy</h2>

      {/* MY DEPARTMENTS */}
      {hasPermission("VIEW_DEPARTMENT") && (
        <div className="dept-card">
          <h3>🏢 Moje działy</h3>

          {myDepartments.map((dep) => (
            <div key={dep.id} className="dept-section">
              <h4>{dep.name}</h4>

              <div className="table-wrapper">
                <table className="dept-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Aktywny</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dep.users?.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.active ? "TAK" : "NIE"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE */}
      {hasPermission("CREATE_DEPARTMENT") && (
        <div className="dept-card">
          <h3>➕ Utwórz dział</h3>

          <div className="dept-create">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa działu"
            />
            <button onClick={createDepartment}>Utwórz</button>
          </div>
        </div>
      )}

      {/* ALL DEPARTMENTS */}
      {hasPermission("VIEW_DEPARTMENTS") && (
        <div className="dept-card">
          <h3>📌 Wszystkie działy</h3>

          <div className="table-wrapper">
            <table className="dept-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nazwa</th>
                  {(canManageUsers || canEditDepartments) && <th>Akcja</th>}
                </tr>
              </thead>

              <tbody>
                {departments.map((d) => {
                  const expanded = expandedDepartments.includes(d.id);
                  const hasUsers = d.users?.length > 0;

                  return (
                    <>
                      <tr
                        key={d.id}
                        className={`department-row ${
                          expanded ? "active" : ""
                        }`}
                        onClick={() =>
                          canManageUsers && toggleDepartment(d.id)
                        }
                      >
                        <td>
                          {canManageUsers && (expanded ? "▼" : "▶")} {d.id}
                        </td>
                        <td>{d.name}</td>

                        {(canManageUsers || canEditDepartments) && (
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="dept-actions">
                              {canEditDepartments && (
                                <button
                                  className="dept-edit-btn"
                                  onClick={() => openEditModal(d)}
                                >
                                  Edytuj nazwę
                                </button>
                              )}

                              {canManageUsers && (
                                <button
                                  className="dept-assign-btn"
                                  onClick={() =>
                                    setAssignModal({ deptId: d.id })
                                  }
                                >
                                  Przypisz pracownika
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>

                      {expanded && canManageUsers && (
                        <tr className="expanded-row">
                          <td colSpan="3">
                            <div className="expanded-content">
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <h4>👥 Użytkownicy działu</h4>

                                {canManageUsers && (
                                  <button
                                    className="remove-all-btn"
                                    disabled={!hasUsers}
                                    onClick={() =>
                                      hasUsers &&
                                      setDeleteAllConfirm({
                                        deptId: d.id,
                                      })
                                    }
                                  >
                                    Usuń wszystkich
                                  </button>
                                )}
                              </div>

                              <table className="inner-table">
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Aktywny</th>
                                    <th>Akcja</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {hasUsers ? (
                                    d.users.map((u) => (
                                      <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.email}</td>
                                        <td>
                                          {u.active ? "TAK" : "NIE"}
                                        </td>
                                        <td>
                                          <button
                                            className="remove-btn"
                                            onClick={() =>
                                              removeUser(d.id, u.id)
                                            }
                                          >
                                            Usuń
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4">
                                        Brak użytkowników
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT MODAL */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>✏️ Edytuj dział</h3>

            <p>
              Aktualna nazwa: <b>{editModal.name}</b>
            </p>

            <input
              className="modal-input"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError("");
              }}
              placeholder="Nowa nazwa działu"
            />

            {editError && (
              <p style={{ color: "red", marginTop: "10px", fontSize: "13px" }}>
                {editError}
              </p>
            )}

            <div className="modal-actions">
              <button
                className="modal-btn"
                onClick={confirmEditDepartment}
                disabled={!editName.trim() || loading}
              >
                {loading ? "..." : "Zapisz"}
              </button>

              <button
                className="modal-btn danger"
                onClick={() => {
                  setEditModal(null);
                  setEditName("");
                  setEditError("");
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>👤 Przypisz użytkownika</h3>

            <p>
              Dział: <b>{getDeptName(assignModal.deptId)}</b>
            </p>

            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(Number(e.target.value));
                setAssignError("");
              }}
            >
              <option value="">Wybierz użytkownika</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>

            {assignError && (
              <p style={{ color: "red", marginTop: "10px", fontSize: "13px" }}>
                {assignError}
              </p>
            )}

            <div className="modal-actions">
              <button
                className="modal-btn"
                onClick={confirmAssignUser}
                disabled={!selectedUserId || loading}
              >
                {loading ? "..." : "Potwierdź"}
              </button>

              <button
                className="modal-btn danger"
                onClick={() => {
                  setAssignModal(null);
                  setSelectedUserId("");
                  setAssignError("");
                }}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Potwierdzenie</h3>
            <p>Czy na pewno chcesz usunąć użytkownika?</p>

            <div className="modal-actions">
              <button
                className="modal-btn danger"
                onClick={confirmRemoveUser}
              >
                Usuń
              </button>

              <button
                className="modal-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL MODAL */}
      {deleteAllConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⚠️ Usuwanie wszystkich</h3>
            <p>Czy na pewno chcesz usunąć wszystkich użytkowników z tego działu?</p>

            <div className="modal-actions">
              <button
                className="modal-btn danger"
                onClick={confirmRemoveAllUsers}
              >
                Usuń wszystkich
              </button>

              <button
                className="modal-btn"
                onClick={() => setDeleteAllConfirm(null)}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}