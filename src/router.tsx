import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminGuard } from '@/components/auth/AdminGuard';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { SellPage } from '@/pages/SellPage';

// Placeholder for pages we'll build in later days
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-8 text-center text-xl text-muted-foreground">
    {name} — Coming Soon
  </div>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // --- PUBLIC ROUTES ---
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/listings/:id',
        element: <ListingDetailPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/callback',
        element: <OAuthCallbackPage />,
      },

      // --- PROTECTED ROUTES ---
      {
        element: <AuthGuard />,
        children: [
          {
            path: '/sell',
            element: <SellPage />,
          },
          {
            path: '/dashboard',
            element: <Placeholder name="User Dashboard (My Listings)" />,
          },
          {
            path: '/favorites',
            element: <FavoritesPage />,
          },
          {
            path: '/profile',
            element: <Placeholder name="Edit Profile" />,
          },

          // --- ADMIN ONLY ROUTES ---
          {
            element: <AdminGuard />,
            children: [
              {
                path: '/admin',
                element: <Placeholder name="Admin Stats Dashboard" />,
              },
              {
                path: '/admin/users',
                element: <Placeholder name="Admin User Management" />,
              },
              {
                path: '/admin/listings',
                element: <Placeholder name="Admin Listing Moderation" />,
              },
            ],
          },
        ],
      },

      // --- 404 ---
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
