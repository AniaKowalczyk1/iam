import { useEffect, useState, useMemo } from "react";
import { usePermissions } from "../hooks/usePermissions";
import "./EmployeesTab.css";

export default function EmployeesTab() {

  const { hasPermission } = usePermissions();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // =========================
  // FILTERS
  // =========================
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    departmentName: ""
  });

  // =========================
  // SORT
  // =========================
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {

    const fetchEmployees = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8080/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        setEmployees(data);

      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();

  }, []);

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const processedEmployees = useMemo(() => {

    let data = [...employees];

    if (filters.firstName) {
      data = data.filter(e =>
        e.firstName?.toLowerCase().includes(filters.firstName.toLowerCase())
      );
    }

    if (filters.lastName) {
      data = data.filter(e =>
        e.lastName?.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }

    if (filters.email) {
      data = data.filter(e =>
        e.email?.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.position) {
      data = data.filter(e =>
        e.position?.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    if (filters.departmentName) {
      data = data.filter(e =>
        e.departmentName === filters.departmentName
      );
    }

    data.sort((a, b) => {

      let valA = a[sortKey];
      let valB = b[sortKey];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;

  }, [employees, filters, sortKey, sortDir]);

  const uniqueDepartments = [...new Set(employees.map(e => e.departmentName))];

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  const handleSave = (updated) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === updated.id ? updated : emp
      )
    );
    handleCloseModal();
  };

  if (loading) {
    return <p className="loading">Ładowanie...</p>;
  }

  return (
    <div className="emp-wrapper">

      <div className="emp-card">

        <h2 className="emp-title">👥 Pracownicy</h2>

        {/* =========================
            FILTER BAR
        ========================= */}
        <div className="emp-toolbar">

          <input name="firstName" placeholder="Imię"
            value={filters.firstName}
            onChange={handleFilterChange}
          />

          <input name="lastName" placeholder="Nazwisko"
            value={filters.lastName}
            onChange={handleFilterChange}
          />

          <input name="email" placeholder="Email"
            value={filters.email}
            onChange={handleFilterChange}
          />

          <input name="position" placeholder="Stanowisko"
            value={filters.position}
            onChange={handleFilterChange}
          />

          <select
            name="departmentName"
            value={filters.departmentName}
            onChange={handleFilterChange}
          >
            <option value="">Wszystkie działy</option>
            {uniqueDepartments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>

        </div>

        <div className="table-wrapper">

          <table className="emp-table">

            <thead>
              <tr>
                <th onClick={() => toggleSort("id")}>ID</th>
                <th onClick={() => toggleSort("firstName")}>Imię</th>
                <th onClick={() => toggleSort("lastName")}>Nazwisko</th>
                <th onClick={() => toggleSort("position")}>Stanowisko</th>
                <th onClick={() => toggleSort("email")}>Email</th>
                <th>Dział</th>

                {hasPermission("UPDATE_EMPLOYEE") && (
                  <th>Akcje</th>
                )}
              </tr>
            </thead>

            <tbody>

              {processedEmployees.map(employee => (
                <tr key={employee.id} className="emp-row">

                  <td>{employee.id}</td>
                  <td>{employee.firstName}</td>
                  <td>{employee.lastName}</td>
                  <td>{employee.position}</td>
                  <td>{employee.email}</td>
                  <td>{employee.departmentName}</td>

                  {hasPermission("UPDATE_EMPLOYEE") && (
                    <td>
                      <button
                        className="emp-edit-btn"
                        onClick={() => handleEditClick(employee)}
                      >
                        Edytuj
                      </button>
                    </td>
                  )}

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {isModalOpen && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

    </div>
  );
}

// =========================
// MODAL
// =========================
function EditEmployeeModal({ employee, onClose, onSave }) {

  const [form, setForm] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    position: employee.position || "",
    email: employee.email || "",
    departmentName: employee.departmentName || ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/employees/${employee.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          position: form.position,
          email: form.email
        })
      }
    );

    let updated;

    if (response.headers.get("content-type")?.includes("application/json")) {
      updated = await response.json();
    } else {
      updated = { ...employee, ...form };
    }

    if (!response.ok) {
      alert("Błąd aktualizacji");
      return;
    }

    onSave(updated);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h3>✏️ Edytuj pracownika</h3>

        <div className="modal-form">

          <input name="firstName" value={form.firstName} onChange={handleChange} />
          <input name="lastName" value={form.lastName} onChange={handleChange} />
          <input name="position" value={form.position} onChange={handleChange} />
          <input name="email" value={form.email} onChange={handleChange} />
          <input name="departmentName" value={form.departmentName} disabled />

        </div>

        <div className="modal-actions">

          <button className="modal-btn" onClick={handleSubmit}>
            Zapisz
          </button>

          <button className="modal-btn danger" onClick={onClose}>
            Anuluj
          </button>

        </div>

      </div>
    </div>
  );
}