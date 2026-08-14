export type Role = 'admin' | 'staff' | 'student';

export interface User {
  id: number;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  created_at?: string;
  student_id?: string;
  staff_id?: string;
  student_internal_id?: number;
  staff_internal_id?: number;
  full_name?: string;
  profile?: any;
  unread_notifications?: number;
}

export interface Student {
  id: number;
  user_id: number;
  student_id: string;
  full_name: string;
  email: string;
  mobile: string;
  college_name: string;
  degree: string;
  department: string;
  year_of_study: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  account_status?: 'active' | 'inactive';
  batch_name?: string;
  batch_id?: number;
  enrolled_courses_count?: number;
  completed_tests_count?: number;
  avg_score?: number;
}

export interface Staff {
  id: number;
  user_id: number;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  can_create_tests: boolean | number;
  avatar_url?: string;
  created_at: string;
  account_status?: 'active' | 'inactive';
  assigned_batches_count?: number;
  assigned_courses_count?: number;
  batches?: { id: number; name: string }[];
  courses?: { id: number; title: string }[];
}

export interface CourseModule {
  title: string;
  topics: string[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  skills_gained: string[];
  modules: CourseModule[];
  trainer_id?: number;
  trainer_name?: string;
  trainer_email?: string;
  trainer_designation?: string;
  is_published: boolean | number;
  image_url?: string;
  enrolled_students_count?: number;
  batches_count?: number;
  progress?: number;
  enrollment_status?: string;
}

export interface Batch {
  id: number;
  name: string;
  course_id: number;
  course_title?: string;
  course_category?: string;
  trainer_id?: number;
  trainer_name?: string;
  trainer_staff_id?: string;
  start_date: string;
  end_date: string;
  timing: string;
  student_count?: number;
  tests_count?: number;
  students?: Student[];
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface Question {
  id?: number;
  test_id?: number;
  question_text: string;
  question_type: QuestionType;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  correct_answer?: string;
  marks: number;
  explanation?: string | null;
  order_index?: number;
}

export interface Test {
  id: number;
  title: string;
  subject: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  start_date?: string | null;
  end_date?: string | null;
  course_id?: number | null;
  course_title?: string;
  batch_id?: number | null;
  batch_name?: string;
  created_by?: number;
  creator_email?: string;
  status: 'draft' | 'published' | 'archived';
  questions_count?: number;
  submissions_count?: number;
  avg_percentage?: number;
  attempt_id?: number | null;
  attempt_status?: 'in_progress' | 'submitted' | 'expired' | null;
  attempt_score?: number | null;
  attempt_percentage?: number | null;
}

export interface QuestionEvaluation {
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  marks_awarded: number;
  max_marks: number;
  explanation?: string | null;
}

export interface TestAttempt {
  id: number;
  test_id: number;
  test_title?: string;
  subject?: string;
  student_id: number;
  student_name?: string;
  student_email?: string;
  college_name?: string;
  department?: string;
  score: number;
  total_marks: number;
  passing_marks?: number;
  duration_minutes?: number;
  percentage: number;
  passed: boolean | number;
  status: 'in_progress' | 'submitted' | 'expired';
  start_time: string;
  submitted_at?: string;
  breakdown?: QuestionEvaluation[];
}

export interface AttendanceRecord {
  id: number;
  batch_id: number;
  batch_name?: string;
  course_title?: string;
  student_id: number;
  student_name?: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  remarks?: string;
}

export interface Internship {
  id: number;
  title: string;
  domain: string;
  description: string;
  duration: string;
  eligibility: string;
  skills_required: string[];
  learning_outcomes: string[];
  projects: string[];
  is_active: boolean | number;
}

export interface InternshipApplication {
  id: number;
  internship_id?: number;
  internship_title?: string;
  domain: string;
  student_id?: number;
  full_name: string;
  email: string;
  mobile: string;
  college: string;
  degree: string;
  department: string;
  year_of_study: string;
  resume_url?: string;
  motivation: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';
  admin_feedback?: string | null;
  applied_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target_type: 'all' | 'batch' | 'course';
  target_id?: number | null;
  created_by: number;
  author_name?: string;
  author_role?: string;
  batch_name?: string;
  course_title?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean | number;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company_or_college: string;
  content: string;
  rating: number;
  avatar_url?: string;
  is_active: boolean | number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}
