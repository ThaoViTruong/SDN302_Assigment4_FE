export function hasAdminAccess(user) {
  const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";

  return Boolean(user?.admin || user?.isAdmin || role === "admin");
}

export function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    admin: hasAdminAccess(user),
  };
}
