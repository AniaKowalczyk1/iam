//import { useEffect, useState } from "react";
//import { api } from "../api/axios";
//import "./AdminPage.css";
//
//export default function AdminPage() {
//  // =========================
//  // FORM STATE
//  // =========================
//  const [email, setEmail] = useState("");
//  const [password, setPassword] = useState("");
//
//  const [firstName, setFirstName] = useState("");
//  const [lastName, setLastName] = useState("");
//  const [position, setPosition] = useState("");
//
//  const [roles, setRoles] = useState([]);
//  const [departments, setDepartments] = useState([]);
//
//  const [roleOptions, setRoleOptions] = useState([]);
//  const [departmentOptions, setDepartmentOptions] = useState([]);
//
//  const [permissionId, setPermissionId] = useState("");
//  const [effect, setEffect] = useState("GRANT");
//  const [reason, setReason] = useState("");
//  const [permissions, setPermissions] = useState([]);
//
//  // =========================
//  // USERS
//  // =========================
//  const [users, setUsers] = useState([]);
//  const [loading, setLoading] = useState(false);
//
//  useEffect(() => {
//    loadMeta();
//    loadUsers();
//  }, []);
//
//  const loadMeta = async () => {
//    try {
//      const rolesRes = await api.get("/roles");
//      const deptRes = await api.get("/departments");
//
//      setRoleOptions(rolesRes.data);
//      setDepartmentOptions(deptRes.data);
//    } catch (err) {
//      console.error(err);
//    }
//  };
//
//  const loadUsers = async () => {
//    try {
//      setLoading(true);
//      const res = await api.get("/users");
//      setUsers(res.data);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  // =========================
//  // PERMISSIONS
//  // =========================
//  const addPermission = () => {
//    setPermissions([
//      ...permissions,
//      { permissionId: Number(permissionId), effect, reason }
//    ]);
//
//    setPermissionId("");
//    setReason("");
//  };
//
//  // =========================
//  // CREATE USER
//  // =========================
//  const createUser = async () => {
//    try {
//      await api.post("/admin/users", {
//        email,
//        password,
//        firstName,
//        lastName,
//        position,
//        roles,
//        departmentIds: departments,
//        permissions
//      });
//
//      alert("Użytkownik utworzony");
//
//      setEmail("");
//      setPassword("");
//      setFirstName("");
//      setLastName("");
//      setPosition("");
//      setRoles([]);
//      setDepartments([]);
//      setPermissions([]);
//
//      loadUsers();
//    } catch (err) {
//      console.error(err);
//      alert("Błąd tworzenia użytkownika");
//    }
//  };
//
//  return (
//    <div className="admin-wrapper">
//
//      <h1 className="admin-title">Panel Admina</h1>
//
//      <div className="admin-container">
//
//        {/* ================= LEFT ================= */}
//        <div style={{ flex: 1 }}>
//
//          {/* USER */}
//          <div className="admin-card">
//            <h3>User</h3>
//
//            <input
//              className="admin-input"
//              placeholder="Email"
//              value={email}
//              onChange={(e) => setEmail(e.target.value)}
//            />
//
//            <input
//              className="admin-input"
//              type="password"
//              placeholder="Password"
//              value={password}
//              onChange={(e) => setPassword(e.target.value)}
//            />
//          </div>
//
//          {/* EMPLOYEE */}
//          <div className="admin-card">
//            <h3>Employee</h3>
//
//            <input
//              className="admin-input"
//              placeholder="First name"
//              value={firstName}
//              onChange={(e) => setFirstName(e.target.value)}
//            />
//
//            <input
//              className="admin-input"
//              placeholder="Last name"
//              value={lastName}
//              onChange={(e) => setLastName(e.target.value)}
//            />
//
//            <input
//              className="admin-input"
//              placeholder="Position"
//              value={position}
//              onChange={(e) => setPosition(e.target.value)}
//            />
//          </div>
//
//          {/* ROLES */}
//          <div className="admin-card">
//            <h3>Roles</h3>
//
//            {roleOptions.map((r) => (
//              <label key={r.id} className="admin-check">
//                <input
//                  type="checkbox"
//                  checked={roles.includes(r.name)}
//                  onChange={(e) => {
//                    if (e.target.checked) {
//                      setRoles([...roles, r.name]);
//                    } else {
//                      setRoles(roles.filter((x) => x !== r.name));
//                    }
//                  }}
//                />
//                {r.name}
//              </label>
//            ))}
//          </div>
//
//          {/* DEPARTMENTS */}
//          <div className="admin-card">
//            <h3>Departments</h3>
//
//            {departmentOptions.map((d) => (
//              <label key={d.id} className="admin-check">
//                <input
//                  type="checkbox"
//                  checked={departments.includes(d.id)}
//                  onChange={(e) => {
//                    if (e.target.checked) {
//                      setDepartments([...departments, d.id]);
//                    } else {
//                      setDepartments(departments.filter((x) => x !== d.id));
//                    }
//                  }}
//                />
//                {d.name}
//              </label>
//            ))}
//          </div>
//
//          {/* PERMISSIONS */}
//          <div className="admin-card">
//            <h3>Permission Overrides</h3>
//
//            <input
//              className="admin-input"
//              placeholder="Permission ID"
//              value={permissionId}
//              onChange={(e) => setPermissionId(e.target.value)}
//            />
//
//            <select
//              className="admin-input"
//              value={effect}
//              onChange={(e) => setEffect(e.target.value)}
//            >
//              <option value="GRANT">GRANT</option>
//              <option value="DENY">DENY</option>
//            </select>
//
//            <input
//              className="admin-input"
//              placeholder="Reason"
//              value={reason}
//              onChange={(e) => setReason(e.target.value)}
//            />
//
//            <button
//              className="admin-button-small"
//              onClick={addPermission}
//            >
//              Dodaj permission
//            </button>
//
//            <ul>
//              {permissions.map((p, i) => (
//                <li key={i}>
//                  {p.permissionId} | {p.effect} | {p.reason}
//                </li>
//              ))}
//            </ul>
//          </div>
//
//          <button className="admin-button" onClick={createUser}>
//            ➕ Utwórz użytkownika
//          </button>
//        </div>
//
//        {/* ================= RIGHT ================= */}
//        <div style={{ flex: 1 }}>
//
//          <div className="admin-card">
//            <h2>👥 Użytkownicy</h2>
//
//            {loading && <p>Loading...</p>}
//
//            <table className="admin-table">
//              <thead>
//                <tr>
//                  <th>ID</th>
//                  <th>Email</th>
//                  <th>Blocked</th>
//                </tr>
//              </thead>
//
//              <tbody>
//                {users.map((u) => (
//                  <tr key={u.id}>
//                    <td>{u.id}</td>
//                    <td>{u.email}</td>
//                    <td>{u.blocked ? "TAK" : "NIE"}</td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//
//          </div>
//
//        </div>
//      </div>
//    </div>
//  );
//}