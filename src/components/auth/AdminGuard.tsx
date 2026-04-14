import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export function AdminGuard() {
  const { user } = useAuthStore();

  // Protect admin routes from normal users
  if (user?.role !== 'admin') {
    toast.error('You do not have permission to access the admin dashboard.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
