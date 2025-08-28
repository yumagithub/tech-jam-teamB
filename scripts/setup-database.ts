
import sql from '../lib/db';

async function setupDatabase() {
  console.log('Starting database setup...');

  try {
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
    console.log('Table "reviews" created or already exists.');

    // You can add more setup queries here if needed

  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1);
  } finally {
    // Ensure the connection is closed
    await sql.end();
    console.log('Database connection closed.');
  }
}

setupDatabase();
