export const routePaths = {
  forgotPassword: '/forgot-password',
  home: '/',
  login: '/login',
  profile: '/profile',
  register: '/register',
} as const;

export function isAppPath(value: unknown): value is (typeof routePaths)[keyof typeof routePaths] {
  return typeof value === 'string' && Object.values(routePaths).includes(value as never);
}
