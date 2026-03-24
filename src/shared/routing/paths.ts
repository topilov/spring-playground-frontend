export const routePaths = {
  forgotPassword: '/forgot-password',
  home: '/',
  login: '/login',
  loginTwoFactor: '/login/2fa',
  profile: '/profile',
  register: '/register',
  resetPassword: '/reset-password',
  settingsSecurity: '/settings/security',
  verifyEmail: '/verify-email',
} as const;

export function isAppPath(value: unknown): value is (typeof routePaths)[keyof typeof routePaths] {
  return typeof value === 'string' && Object.values(routePaths).includes(value as never);
}
