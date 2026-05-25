export const permissionSections = [

  // =========================
  // USERS
  // =========================
  {
    key: "users",
    label: "Users",
    permissions: [
      "VIEW_USERS",
      "CREATE_USER",
      "UPDATE_USER",
      "DELETE_USER",
      "BLOCK_USER",
      "UNBLOCK_USER",
      "RESET_PASSWORD"
    ],

    actions: [
      {
        permission: "VIEW_USERS",
        label: "View users",
        type: "table"
      },

      {
        permission: "CREATE_USER",
        label: "Create user",
        type: "button"
      },

      {
        permission: "UPDATE_USER",
        label: "Edit user",
        type: "button"
      },

      {
        permission: "DELETE_USER",
        label: "Delete user",
        type: "button"
      },

      {
        permission: "BLOCK_USER",
        label: "Block user",
        type: "button"
      },

      {
        permission: "UNBLOCK_USER",
        label: "Unblock user",
        type: "button"
      },

      {
        permission: "RESET_PASSWORD",
        label: "Reset password",
        type: "button"
      }
    ]
  },

  // =========================
  // ROLES / IAM
  // =========================
  {
    key: "roles",
    label: "Roles & IAM",

    permissions: [
      "CREATE_ROLE",
      "UPDATE_ROLE",
      "DELETE_ROLE",
      "VIEW_ROLES",
      "CREATE_PERMISSION",
      "VIEW_PERMISSIONS",
      "ASSIGN_PERMISSION_TO_ROLE",
      "GRANT_PERMISSION_TO_USER",
      "REVOKE_PERMISSION_FROM_USER"
    ],

    actions: [

      {
        permission: "VIEW_ROLES",
        label: "View roles",
        type: "table"
      },

      {
        permission: "CREATE_ROLE",
        label: "Create role",
        type: "button"
      },

      {
        permission: "UPDATE_ROLE",
        label: "Edit role",
        type: "button"
      },

      {
        permission: "DELETE_ROLE",
        label: "Delete role",
        type: "button"
      },

      {
        permission: "CREATE_PERMISSION",
        label: "Create permission",
        type: "button"
      },

      {
        permission: "VIEW_PERMISSIONS",
        label: "View permissions",
        type: "table"
      },

      {
        permission: "ASSIGN_PERMISSION_TO_ROLE",
        label: "Assign permission to role",
        type: "button"
      },

      {
        permission: "GRANT_PERMISSION_TO_USER",
        label: "Grant permission to user",
        type: "button"
      },

      {
        permission: "REVOKE_PERMISSION_FROM_USER",
        label: "Revoke permission from user",
        type: "button"
      }
    ]
  },

  // =========================
  // TASKS
  // =========================
  {
    key: "tasks",
    label: "Tasks",

    permissions: [
      "CREATE_TASK",
      "VIEW_TASK",
      "VIEW_TASKS",
      "VIEW_ALL_TASKS",
      "VIEW_OWN_TASKS",
      "VIEW_DEPARTMENT_TASKS",
      "UPDATE_TASK",
      "DELETE_TASK",
      "ASSIGN_TASK",
      "CHANGE_TASK_STATUS"
    ],

    actions: [

      {
        permission: "VIEW_TASKS",
        label: "View tasks",
        type: "table"
      },

      {
        permission: "VIEW_ALL_TASKS",
        label: "View all tasks",
        type: "table"
      },

      {
        permission: "VIEW_OWN_TASKS",
        label: "View own tasks",
        type: "table"
      },

      {
        permission: "VIEW_DEPARTMENT_TASKS",
        label: "View department tasks",
        type: "table"
      },

      {
        permission: "CREATE_TASK",
        label: "Create task",
        type: "button"
      },

      {
        permission: "UPDATE_TASK",
        label: "Update task",
        type: "button"
      },

      {
        permission: "DELETE_TASK",
        label: "Delete task",
        type: "button"
      },

      {
        permission: "ASSIGN_TASK",
        label: "Assign task",
        type: "button"
      },

      {
        permission: "CHANGE_TASK_STATUS",
        label: "Change task status",
        type: "button"
      }
    ]
  },

  // =========================
  // EMPLOYEES
  // =========================
  {
    key: "employees",
    label: "Employees",

    permissions: [
      "VIEW_EMPLOYEES",
      "UPDATE_EMPLOYEE",
      "CREATE_EMPLOYEE"
    ],

    actions: [

      {
        permission: "VIEW_EMPLOYEES",
        label: "View employees",
        type: "table"
      },

      {
        permission: "UPDATE_EMPLOYEE",
        label: "Edit employee",
        type: "button"
      },

      {
        permission: "CREATE_EMPLOYEE",
        label: "Create employee",
        type: "button"
      }
    ]
  },

  // =========================
  // DEPARTMENTS
  // =========================
  {
    key: "departments",
    label: "Departments",

    permissions: [
      "VIEW_DEPARTMENTS",
      "VIEW_DEPARTMENT"
    ],

    actions: [

      {
        permission: "VIEW_DEPARTMENTS",
        label: "View departments",
        type: "table"
      },

      {
        permission: "VIEW_DEPARTMENT",
        label: "View department",
        type: "table"
      },

      {
        permission: "CREATE_DEPARTMENT",
        label: "Create department",
        type: "button"
      },

      {
        permission: "ASSIGN_REMOVE_USER_TO_FROM_DEPARTMENT",
        label: "Assign user to department",
        type: "button"
      }
    ]
  },

  // =========================
  // REPORTS
  // =========================
  {
    key: "reports",
    label: "Reports",

    permissions: [
      "VIEW_REPORTS",
      "GENERATE_REPORTS",
      "VIEW_AUDIT_LOGS"
    ],

    actions: [

      {
        permission: "VIEW_REPORTS",
        label: "View reports",
        type: "table"
      },

      {
        permission: "GENERATE_REPORTS",
        label: "Generate reports",
        type: "button"
      },

      {
        permission: "VIEW_AUDIT_LOGS",
        label: "View audit logs",
        type: "table"
      }
    ]
  },

  // =========================
  // FINANCE
  // =========================
  {
    key: "finance",
    label: "Finance",

    permissions: [
      "VIEW_FINANCE_TABLE"
    ],

    actions: [

      {
        permission: "VIEW_FINANCE_TABLE",
        label: "View finance table",
        type: "table"
      }
    ]
  }
];