export type UserRole = 'front-desk' | 'marketing' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  doctorId?: string; // For provider role
  organization?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: number;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'front-desk': [
    { resource: 'intake', action: 'create' },
    { resource: 'intake', action: 'read' },
    { resource: 'satisfaction', action: 'create' },
    { resource: 'satisfaction', action: 'read' },
  ],
  'marketing': [
    { resource: 'analytics', action: 'read' },
    { resource: 'dashboard', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'webhooks', action: 'read' },
  ],
  'provider': [
    { resource: 'satisfaction', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'dashboard', action: 'read' },
  ],
  'admin': [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
};

export function hasPermission(user: User, resource: string, action: string): boolean {
  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  // Check if user has the specific permission
  return user.permissions.some(
    permission => 
      (permission.resource === resource || permission.resource === '*') && 
      (permission.action === action || permission.action === '*')
  );
}

export function canAccessResource(user: User, resource: string, action: string): boolean {
  return hasPermission(user, resource, action);
}

// Mock user data for development
export const MOCK_USERS: Record<string, User> = {
  'front-desk@gotooptical.com': {
    id: '1',
    email: 'front-desk@gotooptical.com',
    name: 'Front Desk Staff',
    role: 'front-desk',
    permissions: ROLE_PERMISSIONS['front-desk'],
  },
  'marketing@gotooptical.com': {
    id: '2',
    email: 'marketing@gotooptical.com',
    name: 'Marketing Team',
    role: 'marketing',
    permissions: ROLE_PERMISSIONS['marketing'],
  },
  'dr-goldstick@gotooptical.com': {
    id: '3',
    email: 'dr-goldstick@gotooptical.com',
    name: 'Dr. Bruce Goldstick',
    role: 'provider',
    doctorId: 'dr-goldstick',
    permissions: ROLE_PERMISSIONS['provider'],
  },
  'dr-joby@gotooptical.com': {
    id: '4',
    email: 'dr-joby@gotooptical.com',
    name: 'Dr. Joby',
    role: 'provider',
    doctorId: 'dr-joby',
    permissions: ROLE_PERMISSIONS['provider'],
  },
  'admin@gotooptical.com': {
    id: '5',
    email: 'admin@gotooptical.com',
    name: 'System Administrator',
    role: 'admin',
    permissions: ROLE_PERMISSIONS['admin'],
  },
}; 