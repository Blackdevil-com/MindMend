import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data and upload directories exist
const dataDir = path.resolve(process.cwd(), 'data');
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const resumesDir = path.resolve(uploadsDir, 'resumes');
const avatarsDir = path.resolve(uploadsDir, 'avatars');

[dataDir, uploadsDir, resumesDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const dbPath = path.resolve(dataDir, 'mindmend.db');
export const db = new Database(dbPath);

// Enable WAL mode & foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users table (authentication & roles)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'staff', 'student')) NOT NULL,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Students table
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      student_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT NOT NULL,
      college_name TEXT NOT NULL,
      degree TEXT NOT NULL,
      department TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Staff table
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      staff_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      designation TEXT NOT NULL,
      can_create_tests INTEGER DEFAULT 1,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Courses table
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL,
      skills_gained TEXT NOT NULL, -- JSON array
      modules TEXT NOT NULL,       -- JSON array of {title, topics: []}
      trainer_id INTEGER,
      is_published INTEGER DEFAULT 1,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainer_id) REFERENCES staff(id) ON DELETE SET NULL
    );

    -- Batches table
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      course_id INTEGER NOT NULL,
      trainer_id INTEGER,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      timing TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (trainer_id) REFERENCES staff(id) ON DELETE SET NULL
    );

    -- Batch Students enrollment junction
    CREATE TABLE IF NOT EXISTS batch_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(batch_id, student_id),
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Course Enrollments
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(course_id, student_id),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Online Tests table
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      passing_marks INTEGER NOT NULL,
      start_date DATETIME,
      end_date DATETIME,
      course_id INTEGER,
      batch_id INTEGER,
      created_by INTEGER NOT NULL,
      status TEXT CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Test Questions
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT CHECK(question_type IN ('mcq', 'true_false', 'short_answer')) DEFAULT 'mcq',
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT NOT NULL,
      marks INTEGER NOT NULL DEFAULT 1,
      explanation TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    );

    -- Test Attempts & Submissions
    CREATE TABLE IF NOT EXISTS test_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      score REAL DEFAULT 0,
      total_marks REAL NOT NULL,
      percentage REAL DEFAULT 0,
      passed INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('in_progress', 'submitted', 'expired')) DEFAULT 'in_progress',
      answers_json TEXT, -- JSON array of {question_id, selected_answer, is_correct, marks_awarded}
      UNIQUE(test_id, student_id),
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    -- Daily Attendance table
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      date DATE NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent', 'leave')) NOT NULL,
      remarks TEXT,
      marked_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(batch_id, student_id, date),
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Internships catalogue
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      domain TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      skills_required TEXT NOT NULL, -- JSON array
      learning_outcomes TEXT NOT NULL, -- JSON array
      projects TEXT NOT NULL, -- JSON array
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Internship Applications
    CREATE TABLE IF NOT EXISTS internship_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER,
      domain TEXT NOT NULL,
      student_id INTEGER,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      college TEXT NOT NULL,
      degree TEXT NOT NULL,
      department TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      resume_url TEXT,
      motivation TEXT NOT NULL,
      status TEXT CHECK(status IN ('applied', 'under_review', 'shortlisted', 'accepted', 'rejected')) DEFAULT 'applied',
      admin_feedback TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE SET NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
    );

    -- Announcements
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_type TEXT CHECK(target_type IN ('all', 'batch', 'course')) DEFAULT 'all',
      target_id INTEGER,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- In-app Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Testimonials
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      company_or_college TEXT NOT NULL,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Contact messages
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT CHECK(status IN ('new', 'read', 'replied')) DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Site CMS content
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for high-speed queries
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
    CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON staff(staff_id);
    CREATE INDEX IF NOT EXISTS idx_tests_course ON tests(course_id);
    CREATE INDEX IF NOT EXISTS idx_tests_batch ON tests(batch_id);
    CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
    CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON test_attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_batch_date ON attendance(batch_id, date);
    CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON internship_applications(status);
  `);
  console.log('✅ SQLite Database initialized successfully with all tables and indexes.');
}
