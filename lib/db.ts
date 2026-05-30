import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno (.env.local)');
}

// Reutilizar la conexión en desarrollo para evitar agotar el pool por hot-reloads de Next.js
export const sql = globalForDb.conn ?? postgres(connectionString, {
  max: 10,                 // Máximo de conexiones en el pool
  idle_timeout: 20,        // Tiempo de espera para conexiones inactivas (en segundos)
  connect_timeout: 10,     // Tiempo límite de intento de conexión (en segundos)
  // En Next.js local, a veces es necesario deshabilitar ssl para conexiones de desarrollo local
  ssl: false,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = sql;
}

export default sql;
