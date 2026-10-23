function resolveAdminAccess(user) {
  if (typeof user?.admin === "boolean") {
    return user.admin;
  }

  if (typeof user?.isAdmin === "boolean") {
    return user.isAdmin;
  }

  if (typeof user?.role === "string") {
    return user.role.toLowerCase() === "admin";
  }

  return false;
}

export function hasAdminAccess(user) {
  return Boolean(user?.admin);
}

export function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const normalizedUser = {
    ...user,
    admin: resolveAdminAccess(user),
  };

  delete normalizedUser.isAdmin;
  delete normalizedUser.role;

  return normalizedUser;
}
