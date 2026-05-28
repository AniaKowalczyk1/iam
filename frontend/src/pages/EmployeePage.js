import { useMemo, useState } from "react";

import { usePermissions } from "../hooks/usePermissions";

import Sidebar from "../components/Sidebar";

import UsersTab from "../components/UsersTab";
import TasksTab from "../components/TasksTab";
import FinanceTab from "../components/FinanceTab";
import ReportsTab from "../components/ReportsTab";

import RolesTab from "../components/RolesTab";
import PermissionsTab from "../components/PermissionsTab";
import EmployeesTab from "../components/EmployeesTab";
import DepartmentsTab from "../components/DepartmentsTab";
import AuditTab from "../components/AuditTab";

import "./EmployeePage.css";

export default function EmployeePage() {

  const {
    user,
    permissions,
    hasPermission,
    loading
  } = usePermissions();

  const [activeTab, setActiveTab] =
    useState(null);

  // =========================
  // DYNAMIC TABS
  // =========================
  const tabs = useMemo(() => {

    const arr = [];

    // USERS
    if (
      hasPermission("VIEW_USERS") ||
      hasPermission("CREATE_USER")
    ) {
      arr.push({
        key: "users",
        label: "Użytkownicy"
      });
    }

    // TASKS
    if (
      hasPermission("VIEW_ALL_TASKS") ||
      hasPermission("VIEW_OWN_TASKS")||
      hasPermission("VIEW_DEPARTMENT_TASKS")
    ) {
      arr.push({
        key: "tasks",
        label: "Zadania"
      });
    }

    // ROLES
    if (
      hasPermission("VIEW_ROLES")
    ) {
      arr.push({
        key: "roles",
        label: "Role"
      });
    }

    // PERMISSIONS
    if (
      hasPermission("GRANT_PERMISSION_TO_USER") ||
      hasPermission("REVOKE_PERMISSION_FROM_USER")
    ) {
      arr.push({
        key: "permissions",
        label: "Zezwolenia"
      });
    }

    // EMPLOYEES
    if (
      hasPermission("VIEW_EMPLOYEES")
    ) {
      arr.push({
        key: "employees",
        label: "Pracownicy"
      });
    }

    // DEPARTMENTS
    if (
      hasPermission("VIEW_DEPARTMENTS")
    ) {
      arr.push({
        key: "departments",
        label: "Działy"
      });
    }

    // REPORTS
    if (
      hasPermission("VIEW_REPORTS")
    ) {
      arr.push({
        key: "reports",
        label: "Raporty"
      });
    }

    // AUDIT
    if (
      hasPermission("VIEW_AUDIT_LOGS")
    ) {
      arr.push({
        key: "audit",
        label: "Audyt"
      });
    }

    // FINANCE
    if (
      hasPermission("VIEW_FINANCE_TABLE")
    ) {
      arr.push({
        key: "finance",
        label: "Finanse"
      });
    }

    return arr;

  }, [permissions, hasPermission]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <p>Ładowanie...</p>;
  }

  const currentTab =
    activeTab || tabs[0]?.key;

  return (
    <div className="employee-layout">

      {/* SIDEBAR */}
      <Sidebar
        tabs={tabs}
        activeTab={currentTab}
        setActiveTab={setActiveTab}
        user={user}
      />

      {/* CONTENT */}
      <div className="employee-content">

        <h1>Panel użytkownika</h1>

        {/* USERS */}
        {currentTab === "users" && (
          <UsersTab />
        )}

        {/* TASKS */}
        {currentTab === "tasks" && (
          <TasksTab />
        )}

        {/* ROLES */}
        {currentTab === "roles" && (
          <RolesTab />
        )}

        {/* PERMISSIONS */}
        {currentTab === "permissions" && (
          <PermissionsTab />
        )}

        {/* EMPLOYEES */}
        {currentTab === "employees" && (
          <EmployeesTab />
        )}

        {/* DEPARTMENTS */}
        {currentTab === "departments" && (
          <DepartmentsTab />
        )}

        {/* REPORTS */}
        {currentTab === "reports" && (
          <ReportsTab />
        )}

        {/* AUDIT */}
        {currentTab === "audit" && (
          <AuditTab />
        )}

        {/* FINANCE */}
        {currentTab === "finance" && (
          <FinanceTab />
        )}

      </div>
    </div>
  );
}