import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../config/database.js';

export async function seedDatabase() {
  initDatabase();

  console.log('🌱 Starting database seed with admin only...');

  // Disable foreign keys temporarily during cleanup
  db.exec('PRAGMA foreign_keys = OFF');

  const tables = [
    'users', 'students', 'staff', 'courses', 'course_enrollments', 'batches', 
    'batch_students', 'tests', 'questions', 'test_attempts', 'attendance', 
    'internship_applications', 'announcements', 'notifications', 'testimonials', 
    'contact_messages', 'site_content'
  ];

  tables.forEach(table => {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
      db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
    } catch (e) {
      console.warn(`Could not clear table ${table}:`, e.message);
    }
  });

  db.exec('PRAGMA foreign_keys = ON');

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // Create Superadmin User
  const adminUser = db.prepare(
    "INSERT INTO users (email, password_hash, role, status) VALUES ('admin@mindmend.edu', ?, 'admin', 'active')"
  ).run(adminPasswordHash);

  console.log('✅ Database reset successfully. Only Superadmin admin@mindmend.edu seeded.');
}
