
import postgres from 'postgres';

// .env.local or docker-compose environment variables will be used
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is not defined in environment variables');
}

// In a local Docker environment, SSL is not required.
// For cloud databases (like Vercel Postgres), you might need:
// const sql = postgres(connectionString, { ssl: 'require' });
const sql = postgres(connectionString);

export default sql;
