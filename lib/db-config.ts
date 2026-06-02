const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function getDatabaseSchema(envValue = process.env.DATABASE_SCHEMA) {
  const schema = envValue?.trim();
  return schema || "absence_control";
}

export function getSearchPath(schema = getDatabaseSchema()) {
  return schema.includes(",") ? schema : `${schema}, public`;
}

export function shouldUseSsl(connectionString: string) {
  try {
    const { hostname } = new URL(connectionString);
    return !LOCAL_HOSTS.has(hostname.toLowerCase());
  } catch {
    return false;
  }
}
