import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../config/database.js';

export async function seedDatabase() {
  initDatabase();

  // Check if admin already exists - if so, skip seeding to preserve all user data
  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@mindmend.edu'").get();
  if (existingAdmin) {
    console.log('✅ Database already seeded. Skipping to preserve existing data.');
    return;
  }

  console.log('🌱 Fresh database detected. Seeding with admin account...');

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // Create Superadmin User
  db.prepare(
    "INSERT INTO users (email, password_hash, role, status) VALUES ('admin@mindmend.edu', ?, 'admin', 'active')"
  ).run(adminPasswordHash);

  console.log('✅ Database seeded successfully. Superadmin admin@mindmend.edu created.');
}
