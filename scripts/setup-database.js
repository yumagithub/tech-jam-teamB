
// This script uses CommonJS require because it's a simple Node.js script,
// not part of the Next.js ESM environment.
const postgres = require('postgres');

async function setupDatabase() {
  console.log('Starting database setup...');

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
  }

  let sql;
  try {
    // Connect to PostgreSQL
    sql = postgres(connectionString);
    console.log('Successfully connected to the database.');

    // Create the 'reviews' table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        restaurant_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        reviewer_name VARCHAR(100) NOT NULL,
        is_gourmet_meister BOOLEAN DEFAULT FALSE,
        body TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "reviews" created successfully or already exists.');

  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1);
  } finally {
    if (sql) {
      // Ensure the connection is closed
      await sql.end();
      console.log('Database connection closed.');
    }
  }
}

setupDatabase();
