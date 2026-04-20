import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

/**
 * This page handles the redirect from the backend after Google OAuth.
 * The backend redirects to: /auth/callback?token=JWT&user=BASE64_JSON
 * 
 * Adjust the query param parsing below to match your backend's actual
 * callback response format.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    try {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      if (!token) {
        throw new Error('No token received from the server.');
      }

      // The backend may encode the user object as base64 JSON in a query param
      let user;
      if (userParam) {
        try {
          user = JSON.parse(atob(userParam));
        } catch {
          user = JSON.parse(decodeURIComponent(userParam));
        }
      }

      if (!user) {
        throw new Error('No user data received from the server.');
      }

      login(token, user);
      toast.success(`Welcome, ${user.first_name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('OAuth callback error:', err);
      toast.error(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}
