export function getDashboardPath(role: string) {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'REGISTRAR_ADMIN':
      return '/registrar/dashboard';
    case 'FINANCE_ADMIN':
      return '/finance/dashboard';
    case 'GUIDANCE_ADMIN':
      return '/guidance/dashboard';
    default:
      return '/login';
  }
}
