import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback,
  redirectTo = '/login'
}) => {
  const { user } = useAuth();

  // If user is not logged in
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#fff7f5',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{ color: '#a52a2a', marginBottom: '1rem' }}>Authentication Required</h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Please log in to access this page.
        </p>
        <a 
          href={redirectTo} 
          style={{ 
            background: '#a52a2a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  // If user doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Don't show access denied for customer-only sections to higher privilege users
    // They should just not see the section rather than get an access denied message
    if (allowedRoles.length === 1 && allowedRoles[0] === 'CUSTOMER' && 
        ['CASHIER', 'CHEF', 'MANAGER', 'ADMIN'].includes(user.role)) {
      return null;
    }
    
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#fff7f5',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{ color: '#a52a2a', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          You don't have permission to view this page.
        </p>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          <strong>Your role:</strong> {user.role}
        </p>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          <strong>Required roles:</strong> {allowedRoles.join(', ')}
        </p>
        <a 
          href="/" 
          style={{ 
            background: '#a52a2a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          ← Back to Home
        </a>
      </div>
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminOnly: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['ADMIN']} {...props} />
);

export const ManagerAndAbove: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['ADMIN', 'MANAGER']} {...props} />
);

export const StaffOnly: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'CHEF']} {...props} />
);

export const CashierAccess: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']} {...props} />
);

export const KitchenAccess: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['ADMIN', 'CHEF']} {...props} />
);

export const CustomerAndAbove: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard allowedRoles={['CUSTOMER', 'CASHIER', 'CHEF', 'MANAGER', 'ADMIN']} {...props} />
);

export default RoleGuard;
