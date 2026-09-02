import type { UserRole } from '../types'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  founder: 'Founder',
  manager: 'Manager',
  employee: 'Employee',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#f59e0b',
  founder: '#3b82f6',
  manager: '#a855f7',
  employee: '#22c55e',
}

export interface Permission {
  viewProjects: boolean
  createProject: boolean
  editProject: boolean
  deleteProject: boolean
  viewTasks: boolean
  createTask: boolean
  assignTask: boolean
  completeTask: boolean
  viewStock: boolean
  manageStock: boolean
  viewCustomers: boolean
  manageCustomers: boolean
  viewNetwork: boolean
  manageNetwork: boolean
  uploadDocuments: boolean
  viewAnalytics: boolean
  manageEmployees: boolean
  manageManagers: boolean
  manageUsers: boolean
  changeRoles: boolean
  accessAdminPortal: boolean
  accessExecutiveControlCenter: boolean
  manageSettings: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    viewProjects: true,
    createProject: true,
    editProject: true,
    deleteProject: true,
    viewTasks: true,
    createTask: true,
    assignTask: true,
    completeTask: true,
    viewStock: true,
    manageStock: true,
    viewCustomers: true,
    manageCustomers: true,
    viewNetwork: true,
    manageNetwork: true,
    uploadDocuments: true,
    viewAnalytics: true,
    manageEmployees: true,
    manageManagers: true,
    manageUsers: true,
    changeRoles: true,
    accessAdminPortal: true,
    accessExecutiveControlCenter: true,
    manageSettings: true,
  },
  founder: {
    viewProjects: true,
    createProject: true,
    editProject: true,
    deleteProject: true,
    viewTasks: true,
    createTask: true,
    assignTask: true,
    completeTask: true,
    viewStock: true,
    manageStock: true,
    viewCustomers: true,
    manageCustomers: true,
    viewNetwork: true,
    manageNetwork: true,
    uploadDocuments: true,
    viewAnalytics: true,
    manageEmployees: true,
    manageManagers: true,
    manageUsers: true,
    changeRoles: false,
    accessAdminPortal: false,
    accessExecutiveControlCenter: false,
    manageSettings: false,
  },
  manager: {
    viewProjects: true,
    createProject: true,
    editProject: true,
    deleteProject: false,
    viewTasks: true,
    createTask: true,
    assignTask: true,
    completeTask: true,
    viewStock: true,
    manageStock: true,
    viewCustomers: true,
    manageCustomers: true,
    viewNetwork: true,
    manageNetwork: true,
    uploadDocuments: true,
    viewAnalytics: true,
    manageEmployees: true,
    manageManagers: false,
    manageUsers: false,
    changeRoles: false,
    accessAdminPortal: false,
    accessExecutiveControlCenter: false,
    manageSettings: false,
  },
  employee: {
    viewProjects: true,
    createProject: false,
    editProject: false,
    deleteProject: false,
    viewTasks: true,
    createTask: false,
    assignTask: false,
    completeTask: true,
    viewStock: false,
    manageStock: false,
    viewCustomers: false,
    manageCustomers: false,
    viewNetwork: false,
    manageNetwork: false,
    uploadDocuments: true,
    viewAnalytics: false,
    manageEmployees: false,
    manageManagers: false,
    manageUsers: false,
    changeRoles: false,
    accessAdminPortal: false,
    accessExecutiveControlCenter: false,
    manageSettings: false,
  },
}

export function getRoleLabel(role: UserRole) {
  return ROLE_LABELS[role]
}

export function hasPermission(role: UserRole, permission: keyof Permission) {
  return ROLE_PERMISSIONS[role][permission]
}
