import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { usePermissions } from "../hooks/usePermissions";
import "./UsersTab.css";

export default function UsersTab() {
  const [currentUser, setCurrentUser] = useState(null);
  const { hasPermission } = usePermissions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");

  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [permissionId, setPermissionId] = useState("");
  const [effect, setEffect] = useState("GRANT");
  const [reason, setReason] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  const [roleHelpOpen, setRoleHelpOpen] = useState(false);
  const [roleHelpData, setRoleHelpData] = useState([]);
  // =========================
  // USERS
  // =========================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // MODALS
  // =========================
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [blockModal, setBlockModal] = useState(null);
  const [unblockModal, setUnblockModal] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadMeta();
    loadUsers();
    loadMe();
  }, []);

  const loadMeta = async () => {
    try {
      const rolesRes = await api.get("/roles");
      const deptRes = await api.get("/departments");
      const permRes = await api.get("/permissions");

      setRoleOptions(rolesRes.data);
      setDepartmentOptions(deptRes.data);
      setAvailablePermissions(permRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoleHelp = async () => {
    try {
      const res = await api.get("/roles/with-permissions");
      setRoleHelpData(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  // =========================
  // VALIDATION
  // =========================
  const validateForm = () => {

    const newErrors = {};

    // EMAIL
    if (!email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Niepoprawny email";
    }

    // PASSWORD
    if (!password.trim()) {
      newErrors.password = "Hasło jest wymagane";
    } else if (password.length < 8) {
      newErrors.password = "Hasło musi mieć minimum 8 znaków";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Hasło musi zawierać wielką literę";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Hasło musi zawierać małą literę";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Hasło musi zawierać cyfrę";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "Hasło musi zawierać znak specjalny";
    }

    // FIRST NAME
    if (!firstName.trim()) {
      newErrors.firstName = "Imię jest wymagane";
    } else if (!/^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s-]+$/.test(firstName)) {
      newErrors.firstName = "Imię może zawierać tylko litery";
    } else if (firstName.length < 2) {
      newErrors.firstName = "Imię jest za krótkie";
    }

    // LAST NAME
    if (!lastName.trim()) {
      newErrors.lastName = "Nazwisko jest wymagane";
    } else if (!/^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s-]+$/.test(lastName)) {
      newErrors.lastName = "Nazwisko może zawierać tylko litery";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Nazwisko jest za krótkie";
    }

    // POSITION
    if (!position.trim()) {
      newErrors.position = "Stanowisko jest wymagane";
    } else if (position.length < 2) {
      newErrors.position = "Stanowisko jest za krótkie";
    } else if (!/^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s-]+$/.test(position)) {
            newErrors.position = "Pozycja może zawierać tylko litery";
    } else if (!/^[A-Za-zÀ-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż0-9\s\-_/()]+$/.test(position)) {
      newErrors.position = "Stanowisko zawiera niedozwolone znaki";
    }

    // ROLE
    if (roles.length === 0) {
      newErrors.roles = "Wybierz rolę";
    }

    // DEPARTMENTS
    if (departments.length === 0) {
      newErrors.departments = "Wybierz dział";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const addPermission = () => {
    const perm = availablePermissions.find(p => p.id === Number(permissionId));

    if (!perm) return;

    setPermissions([
      ...permissions,
      {
        permissionId: perm.id,
        permissionName: perm.name,
        effect,
        reason
      }
    ]);

    setPermissionId("");
    setReason("");
  };

  const createUser = async () => {

    if (!validateForm()) {
      return;
    }

    try {
      await api.post("/admin/users", {
        email,
        password,
        firstName,
        lastName,
        position,
        roles,
        departmentIds: departments,
        permissions
      });

      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPosition("");
      setRoles([]);
      setDepartments([]);
      setPermissions([]);
      setErrors({});

      setSuccessModal(true);

      loadUsers();

    } catch (err) {
      console.error(err);
      alert("Błąd tworzenia użytkownika");
    }
  };

  // =========================
  // DELETE USER (MODAL)
  // =========================
  const deleteUser = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      await api.delete(`/admin/users/${deleteConfirm}`);
      setDeleteConfirm(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Błąd podczas usuwania użytkownika");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // BLOCK / UNBLOCK
  // =========================
  const blockUser = (id) => {
    setBlockModal(id);
    setBlockReason("");
  };

  const confirmBlockUser = async () => {
    if (!blockReason.trim()) return;

    try {
      await api.post(`/admin/users/${blockModal}/block`, {
        reason: blockReason
      });

      setBlockModal(null);
      setBlockReason("");
      await loadUsers();

    } catch (err) {
      console.error(err);
      alert("Błąd blokowania użytkownika");
    }
  };

  const unblockUser = (id) => {
    setUnblockModal(id);
  };

  const confirmUnblockUser = async () => {
    try {
      await api.post(`/admin/users/${unblockModal}/unblock`, {});
      setUnblockModal(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Błąd odblokowywania użytkownika");
    }
  };

  const removePermission = (index) => {
    setPermissions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-wrapper">

      {/* ================= CREATE USER ================= */}
      {hasPermission("CREATE_USER") && (
        <div className="admin-card">

          <h3>➕ Utwórz użytkownika</h3>

          <input
            className="admin-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errors.email && (
            <div className="field-error">
              {errors.email}
            </div>
          )}

          {/* PASSWORD */}
          <div className="auth-input-group">


            <div className="password-wrapper">

              <input
                className="admin-input"
                type={showPassword ? "text" : "password"}
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ukryj" : "Pokaż"}
              </button>

            </div>

            {errors.password && (
              <div className="field-error">
                {errors.password}
              </div>
            )}

          </div>

          <input
            className="admin-input"
            placeholder="Imię"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          {errors.firstName && (
            <div className="field-error">
              {errors.firstName}
            </div>
          )}

          <input
            className="admin-input"
            placeholder="Nazwisko"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {errors.lastName && (
            <div className="field-error">
              {errors.lastName}
            </div>
          )}

          <input
            className="admin-input"
            placeholder="Pozycja"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />

          {errors.position && (
            <div className="field-error">
              {errors.position}
            </div>
          )}


          <h4>
            Rola
            <button
              type="button"
              className="role-help-btn"
              onClick={() => {
                setRoleHelpOpen(true);
                loadRoleHelp();
              }}
            >
              ❓
            </button>
          </h4>

          {roleOptions.map((r) => (
            <label key={r.id} className="admin-check">
              <input
                type="radio"
                name="role"
                checked={roles.includes(r.name)}
                onChange={() => {
                  setRoles([r.name]);
                }}
              />
              {r.name}
            </label>
          ))}

          {errors.roles && (
            <div className="field-error">
              {errors.roles}
            </div>
          )}

          <h4>Działy</h4>
          {departmentOptions.map((d) => (
            <label key={d.id} className="admin-check">
              <input
                type="checkbox"
                checked={departments.includes(d.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setDepartments([...departments, d.id]);
                  } else {
                    setDepartments(departments.filter(x => x !== d.id));
                  }
                }}
              />
              {d.name}
            </label>
          ))}

          {errors.departments && (
            <div className="field-error">
              {errors.departments}
            </div>
          )}

          {/* ================= PERMISSIONS  ================= */}
          {hasPermission("GRANT_PERMISSION_TO_USER") && (
            <>
              <h4>Zezwolenia</h4>

              <select
                className="admin-input"
                value={permissionId}
                onChange={(e) => setPermissionId(e.target.value)}
              >
                <option value="">Wybierz uprawnienie</option>
                {availablePermissions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="admin-input"
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
              >
                <option value="GRANT">GRANT</option>
                <option value="DENY">DENY</option>
              </select>

              <input
                className="admin-input"
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <button className="admin-button-small" onClick={addPermission}>
                Dodaj uprawnienie
              </button>

              <ul>
                {permissions.map((p, i) => (
                  <li key={i} className="perm-item">
                    <span>
                      {p.permissionName} | {p.effect} | {p.reason}
                    </span>

                    <button
                      type="button"
                      onClick={() => removePermission(i)}
                      style={{
                        marginLeft: "10px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        cursor: "pointer"
                      }}
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <button className="admin-button" onClick={createUser}>
            ➕ Utwórz użytkownika
          </button>

        </div>
      )}

      {/* ================= USERS LIST ================= */}
      <div className="admin-card">

        <h3>👤 Lista użytkowników</h3>

        {loading && <p>Loading...</p>}

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Blokada</th>
                {(hasPermission("DELETE_USER") ||
                  hasPermission("BLOCK_USER") ||
                  hasPermission("UNBLOCK_USER")) && (
                  <th>Akcja</th>
                )}
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.blocked ? "TAK" : "NIE"}</td>

                  {(hasPermission("DELETE_USER") ||
                    hasPermission("BLOCK_USER") ||
                    hasPermission("UNBLOCK_USER")) && (
                    <td>

                      {hasPermission("DELETE_USER") && u.email !== currentUser?.email && (
                        <button onClick={() => deleteUser(u.id)}>
                          Usuń
                        </button>
                      )}



                      {hasPermission("BLOCK_USER") &&
                       !u.blocked &&
                       u.email !== currentUser?.email && (
                        <button onClick={() => blockUser(u.id)}>
                          Block
                        </button>
                      )}

                      {hasPermission("UNBLOCK_USER") && u.blocked && (
                        <button onClick={() => unblockUser(u.id)}>
                          Unblock
                        </button>
                      )}

                    </td>
                  )}
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      {/* ================= MODALS  ================= */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⚠️ Usuwanie użytkownika</h3>
            <p>Czy na pewno usunąć użytkownika?</p>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDeleteUser}>
                Usuń
              </button>
              <button className="btn btn-neutral" onClick={() => setDeleteConfirm(null)}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {blockModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🚫 Blokada użytkownika</h3>

            <input
              className="admin-input"
              placeholder="Powód blokady"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmBlockUser}>
                Zablokuj
              </button>
              <button className="btn btn-neutral" onClick={() => setBlockModal(null)}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {unblockModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>🔓 Odblokowanie użytkownika</h3>
            <p>Czy na pewno odblokować użytkownika?</p>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={confirmUnblockUser}>
                Odblokuj
              </button>
              <button className="btn btn-neutral" onClick={() => setUnblockModal(null)}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>✅ Sukces</h3>

            <p>Użytkownik został utworzony.</p>

            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={() => setSuccessModal(false)}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

      {roleHelpOpen && (
        <div className="modal-overlay">
          <div className="modal-box--large">

            <h3>📌 Role i ich uprawnienia</h3>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rola</th>
                  <th>Uprawnienia</th>
                </tr>
              </thead>

              <tbody>
                {roleHelpData.map((r) => (
                  <tr key={r.id}>
                    <td>{r.roleName}</td>
                    <td>
                      {r.permissions.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="modal-actions">
              <button
                className="btn btn-neutral"
                onClick={() => setRoleHelpOpen(false)}
              >
                Zamknij
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}