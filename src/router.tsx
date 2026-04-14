import { createBrowserRouter } from 'react-router';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminGuard } from '@/components/auth/AdminGuard';

// Helper for UI placeholders before we build the actual pages
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex h-screen w-full items-center justify-center p-8 text-center text-xl text-muted-foreground">
    {name} (Coming Soon)
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    // element: <RootLayout />, // To be built during Layout step
    element: <Placeholder name="Public Landing Page & Listings Grid" />,
  },
  {
    path: '/listings/:id',
    element: <Placeholder name="Listing Detail Page" />,
  },
  {
    path: '/login',
    element: <Placeholder name="Login Page" />,
  },
  {
    path: '/auth/callback',
    element: <Placeholder name="OAuth Callback Processing" />,
  },
  // --- PROTECTED ROUTES ---
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/sell',
        element: <Placeholder name="Create/Edit Listing Form" />,
      },
      {
        path: '/dashboard',
        element: <Placeholder name="User Dashboard (My Listings)" />,
      },
      {
        path: '/favorites',
        element: <Placeholder name="My Favorited Listings" />,
      },
      {
        path: '/profile',
        element: <Placeholder name="Edit Profile Bio" />,
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
  {
    path: '*',
    element: <Placeholder name="404 - Page Not Found" />,
  }
]);
