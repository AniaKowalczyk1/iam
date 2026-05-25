import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { usePermissions } from "../hooks/usePermissions";
import "./PermissionsTab.css";

export default function PermissionsTab() {
  const { hasPermission, loading } = usePermissions();

  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");

  const [effect, setEffect] = useState("GRANT");
  const [reason, setReason] = useState("");

  const [userPermissions, setUserPermissions] = useState([]);

  const [errorMsg, setErrorMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canGrant = hasPermission("GRANT_PERMISSION_TO_USER");
  const canRevoke = hasPermission("REVOKE_PERMISSION_FROM_USER");

  const loadUserPermissions = (userId) => {
    if (!userId) return;

    api
      .get(`/admin/users/${userId}/permissions`)
      .then((r) => setUserPermissions(r.data));
  };

  useEffect(() => {
    api.get("/users").then((r) => setUsers(r.data));
    api.get("/permissions").then((r) => setPermissions(r.data));
  }, []);

  useEffect(() => {
    loadUserPermissions(selectedUser);
  }, [selectedUser]);

  // =========================
  // GRANT
  // =========================
  const grant = async () => {
    setErrorMsg("");

    if (!selectedUser || !selectedPermission) return;

    try {
      await api.post(`/admin/users/${selectedUser}/permissions`, {
        permissionId: selectedPermission,
        effect,
        reason
      });

      setReason("");
      setSelectedPermission("");
      loadUserPermissions(selectedUser);
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          "To uprawnienie już istnieje"
      );
    }
  };

  // =========================
  // REVOKE (OTWARCIE MODALA)
  // =========================
  const askRevoke = (permissionId) => {
    setDeleteConfirm(permissionId);
  };

  // =========================
  // POTWIERDZENIE USUNIĘCIA
  // =========================
  const confirmRevoke = async () => {
    if (!deleteConfirm) return;

    await api.delete(
      `/admin/users/${selectedUser}/permissions/${deleteConfirm}`
    );

    setDeleteConfirm(null);
    loadUserPermissions(selectedUser);
  };

  const cancelRevoke = () => {
    setDeleteConfirm(null);
  };

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div className="permissions-wrapper">
      <h2>🔐 Uprawnienia</h2>

      {/* WYBÓR UŻYTKOWNIKA */}
      <div className="permission-card">
        <h3>Wybierz użytkownika</h3>

        <select onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Użytkownik</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      </div>

      {/* NADAWANIE */}
      {canGrant && selectedUser && (
        <div className="permission-card">
          <h3>Nadaj uprawnienie</h3>

          <select
            value={selectedPermission}
            onChange={(e) => setSelectedPermission(e.target.value)}
          >
            <option value="">Uprawnienie</option>
            {permissions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select value={effect} onChange={(e) => setEffect(e.target.value)}>
            <option value="GRANT">NADAJ</option>
            <option value="DENY">ODMÓW</option>
          </select>

          <input
            placeholder="Powód"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button onClick={grant}>Nadaj</button>

          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </div>
      )}

      {/* LISTA UPRAWNIEŃ */}
      {selectedUser && (
        <div className="permission-card">
          <h3>Uprawnienia użytkownika</h3>

          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Uprawnienie</th>
                <th>Tryb</th>
                <th>Powód</th>
                {canRevoke && <th>Akcja</th>}
              </tr>
            </thead>

            <tbody>
              {userPermissions.map((up) => (
                <tr key={up.id}>
                  <td>{up.permission?.name}</td>
                  <td>{up.effect}</td>
                  <td>{up.reason || "-"}</td>

                  {canRevoke && (
                    <td>
                      <button onClick={() => askRevoke(up.permission.id)}>
                        Usuń
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================
          MODAL POTWIERDZENIA
      ========================= */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⚠️ Potwierdzenie</h3>
            <p>Czy na pewno chcesz usunąć to uprawnienie?</p>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmRevoke}>
                Tak, usuń
              </button>

              <button className="btn btn-neutral" onClick={cancelRevoke}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}