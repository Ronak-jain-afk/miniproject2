import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/auth-context';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  role: string;
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    const dashboard = `/${user.role}`;
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
}
