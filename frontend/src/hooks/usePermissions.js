import { useAuth } from "./useAuth";

export function usePermissions() {

  const { user, loading } = useAuth();

  const permissions = user?.permissions || [];

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return {
    user,
    permissions,
    hasPermission,
    loading
  };
}