export function getActionType(action) {
  const a = action?.toLowerCase() || "";

  if (a.includes("create")) return "created";
  if (a.includes("update")) return "updated";
  if (a.includes("delete")) return "deleted";
  if (a.includes("assign")) return "assigned";
  if (a.includes("grant")) return "granted";
  if (a.includes("revoke")) return "revoked";
  if (a.includes("block")) return "blocked";

  return "default";
}