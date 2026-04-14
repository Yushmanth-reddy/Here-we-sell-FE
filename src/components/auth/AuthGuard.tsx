import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/lib/store/authStore';

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If the user isn't authenticated, bounce them to the login screen.
  // We pass the current location in state so we can redirect them back after a successful login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child route
  return <Outlet />;
}
