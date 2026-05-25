import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { usePermissions } from "../hooks/usePermissions";
import "./TasksTab.css";

export default function TasksTab() {

  const { hasPermission, loading: permissionLoading } = usePermissions();

  const [ownTasks, setOwnTasks] = useState([]);
  const [deptTasks, setDeptTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [assignees, setAssignees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");

  const [userSearch, setUserSearch] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [assignTaskId, setAssignTaskId] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);

  const [assignSelected, setAssignSelected] = useState([]);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignError, setAssignError] = useState("");

  const [removeAssignee, setRemoveAssignee] = useState(null);

  const canViewOwn = hasPermission("VIEW_OWN_TASKS");
  const canViewDept = hasPermission("VIEW_DEPARTMENT_TASKS");
  const canViewAll = hasPermission("VIEW_ALL_TASKS");

  const canCreate = hasPermission("CREATE_TASK");
  const canAssign = hasPermission("ASSIGN_TASK");
  const canChangeStatus = hasPermission("CHANGE_TASK_STATUS");
  const canDelete = hasPermission("DELETE_TASK");

  const [errors, setErrors] = useState({});

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data || []);
  };

  const loadDepartments = async () => {
    const res = await api.get("/departments");
    setDepartments(res.data || []);
  };

  const loadOwn = async () => {
    const res = await api.get("/tasks/own");
    setOwnTasks(res.data || []);
  };

  const loadDept = async () => {
    const res = await api.get("/tasks/department");
    setDeptTasks(res.data || []);
  };

  const loadAll = async () => {
    const res = await api.get("/tasks/all");
    setAllTasks(res.data || []);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (canViewOwn) await loadOwn();
      if (canViewDept) await loadDept();
      if (canViewAll) await loadAll();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissionLoading) return;

    loadAllData();

    if (canAssign) loadUsers();
    if (canCreate) loadDepartments();
  }, [permissionLoading]);

  const createTask = async () => {

    const newErrors = {};

    if (!title.trim()) newErrors.title = "Podaj nazwę zadania";
    if (!description.trim()) newErrors.description = "Podaj opis";
    if (!status) newErrors.status = "Wybierz status";
    if (!departmentId) newErrors.departmentId = "Wybierz dział";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    await api.post("/tasks", {
      title,
      description,
      status,
      assigneeIds: assignees,
      departmentId: departmentId || null
    });

    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setAssignees([]);
    setDepartmentId("");
    setErrors({});
    await loadAllData();
  };

  const deleteTask = (taskId) => {
    setDeleteConfirm(taskId);
  };

  const changeStatus = async (taskId, status) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/status`, {
        status
      });

      console.log("OK:", res.data);

      await loadAllData();
    } catch (e) {
      console.log("ERROR RESPONSE:", e?.response);
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", e?.response?.data);

      alert("Błąd zmiany statusu");
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirm) return;

    try {
      await api.delete(`/tasks/${deleteConfirm}`);
      setDeleteConfirm(null);
      await loadAllData();
    } catch {
      alert("Błąd usuwania zadania");
    }
  };

  const openAssignModal = (task) => {
    setAssignTaskId(task.id);
    setCurrentTask(task);
    setAssignSelected([]);
    setAssignSearch("");
    setAssignError("");
  };

  const closeAssignModal = () => {
    setAssignTaskId(null);
    setCurrentTask(null);
    setAssignSelected([]);
    setAssignSearch("");
    setAssignError("");
  };

  const confirmAssign = async () => {
    if (!assignSelected.length) {
      setAssignError("Wybierz użytkowników");
      return;
    }

    try {
      await api.put(`/tasks/${assignTaskId}/assign`, {
        userIds: assignSelected
      });

      closeAssignModal();
      await loadAllData();

    } catch (error) {

      const msg =
        error?.response?.data?.message ||
        "Użytkownik jest już przypisany do tego zadania";

      setAssignError(msg);
    }
  };

  const openRemoveAssignee = (taskId, userId) => {
    setRemoveAssignee({ taskId, userId });
  };

  const confirmRemoveAssignee = async () => {
    if (!removeAssignee) return;

    try {
      await api.put(`/tasks/${removeAssignee.taskId}/assign`, {
        userIds: [removeAssignee.userId]
      });

      setRemoveAssignee(null);
      await loadAllData();

    } catch {
      alert("Błąd usuwania użytkownika");
    }
  };

  const availableUsers = users.filter(u => {
    const alreadyAssigned = currentTask?.assignees?.some(
      a => a.id === u.id
    );

    return (
      !alreadyAssigned &&
      u.email.toLowerCase().includes(assignSearch.toLowerCase())
    );
  });

  if (permissionLoading) return <p>Ładowanie...</p>;

  return (
    <div className="tasks-wrapper">

      <h2>📋 Zadania</h2>

      {/* CREATE TASK */}
      {canCreate && (
        <div className="task-card">

          <h3>➕ Utwórz zadanie</h3>

          <div className="task-create">

            {/* NAZWA ZADANIA */}
            <div className="field">
              <label>Nazwa zadania</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
               {errors.title && <small className="error">{errors.title}</small>}
            </div>

            {/* OPIS */}
            <div className="field field-full">
              <label>Opis zadania</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
                {errors.description && <small className="error">{errors.description}</small>}
            </div>

            {/* STATUS */}
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>PENDING</option>
                <option>IN_PROGRESS</option>
                <option>DONE</option>
              </select>
              {errors.status && <small className="error">{errors.status}</small>}
            </div>

            {/* DZIAŁ */}
            <div className="field">
              <label>Dział</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Wybierz dział</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
                {errors.departmentId && (
                  <small className="error">{errors.departmentId}</small>
                )}

            </div>

            {/* ASSIGNEES */}
            <div className="task-create-actions">

              {canAssign && (
                <div className="assignee-box">

                  {/* SEARCH USERS */}
                  <div className="field">
                    <label>Szukaj użytkowników</label>
                    <input
                      className="assignee-search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Wyszukaj..."
                    />
                  </div>

                  <div className="assignee-scroll">
                    {users
                      .filter(u =>
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                      )
                      .map(u => {

                        const checked = assignees.includes(u.id);

                        return (
                          <label key={u.id} className="assignee-row">

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setAssignees(prev =>
                                  checked
                                    ? prev.filter(id => id !== u.id)
                                    : [...prev, u.id]
                                );
                              }}
                            />

                            <span>{u.email}</span>

                          </label>
                        );
                      })}
                  </div>

                </div>
              )}

              <button className="btn btn-neutral" onClick={createTask}>
                Utwórz zadanie
              </button>

            </div>

          </div>
        </div>
      )}

      {/* TASK TABLES */}
      {[ownTasks, deptTasks, allTasks].map((list, i) => {

        const titles = ["Moje zadania", "Zadania działu", "Wszystkie zadania"];
        const canShow = [canViewOwn, canViewDept, canViewAll][i];

        if (!canShow) return null;

        return (
          <div className="task-card" key={i}>
            <h3>{titles[i]}</h3>

            <TaskTable
              tasks={list}
              canAssign={canAssign}
              canChangeStatus={canChangeStatus}
              canDelete={canDelete}
              onDelete={deleteTask}
              onAssign={openAssignModal}
              onRemoveAssignee={openRemoveAssignee}
              onChangeStatus={changeStatus}
            />
          </div>
        );
      })}

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>⚠️ Usuwanie zadania</h3>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDeleteTask}>
                Usuń
              </button>

              <button className="btn btn-neutral" onClick={() => setDeleteConfirm(null)}>
                Anuluj
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {assignTaskId && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>👥 Przypisz użytkowników</h3>

            <input
              className="assignee-search"
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              placeholder="Wyszukaj..."
            />

            {assignError && (
              <p style={{ color: "red" }}>{assignError}</p>
            )}

            <div className="assignee-scroll">
              {availableUsers.map(u => {

                const checked = assignSelected.includes(u.id);

                return (
                  <label key={u.id} className="assignee-row">

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAssignSelected(prev =>
                          checked
                            ? prev.filter(id => id !== u.id)
                            : [...prev, u.id]
                        );
                      }}
                    />

                    <span>{u.email}</span>

                  </label>
                );
              })}
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={confirmAssign}>
                Zapisz
              </button>

              <button className="btn btn-neutral" onClick={closeAssignModal}>
                Anuluj
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REMOVE ASSIGNEE MODAL */}
      {removeAssignee && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>❌ Usuwanie użytkownika</h3>
            <p>Czy na pewno usunąć użytkownika z zadania?</p>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmRemoveAssignee}>
                Usuń
              </button>

              <button className="btn btn-neutral" onClick={() => setRemoveAssignee(null)}>
                Anuluj
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// =========================
// TABLE COMPONENT
// =========================
function TaskTable({
  tasks,
  canAssign,
  canChangeStatus,
  canDelete,
  onDelete,
  onAssign,
  onRemoveAssignee,
  onChangeStatus
}) {
  return (
    <table className="task-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>Tytuł</th>
          <th>Opis</th>
          <th>Status</th>
          <th>Przypisani</th>
          {(canAssign || canChangeStatus || canDelete) && <th>Akcje</th>}
        </tr>
      </thead>

      <tbody>

        {tasks.map(t => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.title}</td>
            <td>{t.description}</td>
            <td>
              {canChangeStatus ? (
                <select
                  value={t.status}
                  onChange={(e) => onChangeStatus(t.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              ) : (
                t.status
              )}
            </td>

            <td>
              {t.assignees?.map(u => (
                <div
                  key={u.id}
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  👤 {u.email}

                  {canAssign && (
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#dc2626",
                        fontWeight: "bold"
                      }}
                      onClick={() => onRemoveAssignee(t.id, u.id)}
                    >
                      ✕
                    </span>
                  )}
                </div>
              ))}
            </td>

            {(canAssign || canChangeStatus || canDelete) && (
              <td>


                {canAssign && (
                  <button className="btn btn-success" onClick={() => onAssign(t)}>
                    Przypisz
                  </button>
                )}

                {canDelete && (
                  <button className="btn btn-danger" onClick={() => onDelete(t.id)}>
                    Usuń
                  </button>
                )}

              </td>
            )}

          </tr>
        ))}

      </tbody>
    </table>
  );
}