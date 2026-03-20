import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { ForgotPasswordPage } from '../pages/forgot-password/ForgotPasswordPage';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/login/LoginPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { RegisterPage } from '../pages/register/RegisterPage';
import { ResetPasswordPage } from '../pages/reset-password/ResetPasswordPage';
import { SecuritySettingsPage } from '../pages/settings/SecuritySettingsPage';
import { VerifyEmailPage } from '../pages/verify-email/VerifyEmailPage';
import { routePaths } from '../shared/routing/paths';
import { AppLayout } from './layout/AppLayout';
import { AnonymousOnlyRoute } from './routes/AnonymousOnlyRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';

export const routes: RouteObject[] = [
  {
    path: routePaths.home,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: routePaths.verifyEmail.slice(1),
        element: <VerifyEmailPage />,
      },
      {
        element: <AnonymousOnlyRoute />,
        children: [
          {
            path: routePaths.login.slice(1),
            element: <LoginPage />,
          },
          {
            path: routePaths.register.slice(1),
            element: <RegisterPage />,
          },
          {
            path: routePaths.forgotPassword.slice(1),
            element: <ForgotPasswordPage />,
          },
          {
            path: routePaths.resetPassword.slice(1),
            element: <ResetPasswordPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: routePaths.profile.slice(1),
            element: <ProfilePage />,
          },
          {
            path: routePaths.settingsSecurity.slice(1),
            element: <SecuritySettingsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const appRouter = createBrowserRouter(routes);
