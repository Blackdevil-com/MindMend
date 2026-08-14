import bcrypt from 'bcryptjs';
import { db, initDatabase } from '../config/database.js';

export async function seedDatabase() {
  initDatabase();

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('🌱 Starting database seed with realistic demo data...');

  const defaultPasswordHash = await bcrypt.hash('Student@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

  // 1. Create Admin
  const adminUser = db.prepare(
    "INSERT INTO users (email, password_hash, role, status) VALUES ('admin@mindmend.edu', ?, 'admin', 'active')"
  ).run(adminPasswordHash);
  const adminUserId = Number(adminUser.lastInsertRowid);

  // 2. Create 3 Staff Members
  const staffMembers = [
    {
      staff_id: 'STF20260001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@mindmend.edu',
      phone: '+91 98765 43210',
      designation: 'Lead Java & Backend Architect',
      can_create_tests: 1,
    },
    {
      staff_id: 'STF20260002',
      name: 'Priya Venkatesh',
      email: 'priya.v@mindmend.edu',
      phone: '+91 98765 43211',
      designation: 'Senior Data Analytics & Power BI Trainer',
      can_create_tests: 1,
    },
    {
      staff_id: 'STF20260003',
      name: 'Arun Kumar',
      email: 'arun.kumar@mindmend.edu',
      phone: '+91 98765 43212',
      designation: 'Aptitude & Corporate Communication Specialist',
      can_create_tests: 1,
    },
  ];

  const staffInternalIds: number[] = [];
  for (const st of staffMembers) {
    const u = db.prepare("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'staff', 'active')")
      .run(st.email, staffPasswordHash);
    const s = db.prepare(`
      INSERT INTO staff (user_id, staff_id, full_name, email, phone, designation, can_create_tests)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(Number(u.lastInsertRowid), st.staff_id, st.name, st.email, st.phone, st.designation, st.can_create_tests);
    staffInternalIds.push(Number(s.lastInsertRowid));
  }

  // 3. Create 10 Students
  const sampleStudents = [
    { name: 'Aakash Patel', email: 'aakash.patel@gmail.com', mobile: '+91 98200 11221', college: 'National Institute of Engineering', degree: 'B.Tech', dept: 'Computer Science', year: '3rd Year' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', mobile: '+91 98200 11222', college: 'Vellore Institute of Technology', degree: 'B.Tech', dept: 'Information Technology', year: '4th Year' },
    { name: 'Rohan Verma', email: 'rohan.verma@gmail.com', mobile: '+91 98200 11223', college: 'PSG College of Technology', degree: 'B.E.', dept: 'Electronics & Communication', year: '3rd Year' },
    { name: 'Divya Iyer', email: 'divya.iyer@gmail.com', mobile: '+91 98200 11224', college: 'SRM Institute of Science and Technology', degree: 'B.Tech', dept: 'Data Science & AI', year: '4th Year' },
    { name: 'Karthik Subramanian', email: 'karthik.s@gmail.com', mobile: '+91 98200 11225', college: 'College of Engineering Guindy', degree: 'B.E.', dept: 'Computer Science', year: 'Final Year' },
    { name: 'Pooja Nair', email: 'pooja.nair@gmail.com', mobile: '+91 98200 11226', college: 'Amrita Vishwa Vidyapeetham', degree: 'B.Tech', dept: 'Computer Science', year: '3rd Year' },
    { name: 'Vikram Deshmukh', email: 'vikram.d@gmail.com', mobile: '+91 98200 11227', college: 'Pune Institute of Computer Technology', degree: 'B.E.', dept: 'Information Technology', year: '3rd Year' },
    { name: 'Ananya Roy', email: 'ananya.roy@gmail.com', mobile: '+91 98200 11228', college: 'Jadavpur University', degree: 'B.E.', dept: 'Computer Science', year: '4th Year' },
    { name: 'Mohammed Farhan', email: 'farhan.m@gmail.com', mobile: '+91 98200 11229', college: 'Osmania University', degree: 'MCA', dept: 'Computer Applications', year: '2nd Year' },
    { name: 'Riya Sengupta', email: 'riya.s@gmail.com', mobile: '+91 98200 11230', college: 'Heritage Institute of Technology', degree: 'B.Tech', dept: 'Data Science', year: '3rd Year' },
  ];

  const studentInternalIds: number[] = [];
  sampleStudents.forEach((st, idx) => {
    const studentIdStr = `STU2026${String(idx + 1).padStart(4, '0')}`;
    const u = db.prepare("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'student', 'active')")
      .run(st.email, defaultPasswordHash);
    const s = db.prepare(`
      INSERT INTO students (user_id, student_id, full_name, email, mobile, college_name, degree, department, year_of_study)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(Number(u.lastInsertRowid), studentIdStr, st.name, st.email, st.mobile, st.college, st.degree, st.dept, st.year);
    studentInternalIds.push(Number(s.lastInsertRowid));
  });

  // 4. Create 5 Courses
  const coursesData = [
    {
      title: 'Java Programming',
      slug: 'java-programming',
      category: 'Software Development',
      description: 'Master core to advanced Java, Object-Oriented principles, multi-threading, JDBC database connectivity, and industry-grade application design with hands-on live coding.',
      duration: '8 Weeks (60 Hours)',
      trainer_id: staffInternalIds[0],
      skills_gained: ['Java 17+', 'Object-Oriented Programming', 'Collections Framework', 'Exception Handling', 'JDBC Database Connectivity', 'Multithreading', 'Design Patterns', 'JUnit Testing'],
      modules: [
        { title: 'Module 1: Java Basics & Syntax', topics: ['Java Architecture & JVM', 'Data Types & Variables', 'Operators & Expressions', 'Control Flow Statements'] },
        { title: 'Module 2: Object-Oriented Programming (OOP)', topics: ['Classes & Objects', 'Inheritance & Polymorphism', 'Encapsulation & Abstraction', 'Interfaces & Abstract Classes'] },
        { title: 'Module 3: Arrays & String Processing', topics: ['1D and 2D Arrays', 'String, StringBuilder, StringBuffer', 'Immutable Classes', 'String Performance'] },
        { title: 'Module 4: Collections Framework', topics: ['List, Set, Map Implementations', 'Generics & Wildcards', 'Iterators & Comparators', 'Stream API & Lambdas'] },
        { title: 'Module 5: Exception Handling & File I/O', topics: ['Try-Catch-Finally Blocks', 'Custom Exceptions', 'File Streams & NIO', 'Serialization'] },
        { title: 'Module 6: JDBC & Advanced Java', topics: ['Connecting MySQL/PostgreSQL', 'PreparedStatement & Transactions', 'DAO Architecture', 'Project Building'] },
      ],
    },
    {
      title: 'Communication Skills',
      slug: 'communication-skills',
      category: 'Career & Soft Skills',
      description: 'Transform your interpersonal communication, spoken English, corporate etiquette, group discussion mastery, and executive interview presentation capabilities.',
      duration: '4 Weeks (30 Hours)',
      trainer_id: staffInternalIds[2],
      skills_gained: ['Spoken English Fluency', 'Grammar & Professional Vocab', 'Presentation Excellence', 'Group Discussion Mastery', 'Interview Communication', 'Active Listening', 'Email & Business Writing'],
      modules: [
        { title: 'Module 1: Spoken English & Grammar Foundation', topics: ['Tenses & Sentence Construction', 'Pronunciation & Neutral Accent', 'Vocabulary Expansion', 'Common Error Elimination'] },
        { title: 'Module 2: Presentation & Public Speaking', topics: ['Structuring Impactful Speeches', 'Overcoming Stage Fear', 'Body Language & Tone Modulation', 'Slide Deck Storytelling'] },
        { title: 'Module 3: Group Discussion & Team Dynamics', topics: ['GD Rules & Evaluation Parameters', 'Initiating & Concluding Discussions', 'Handling Disagreements Tactfully', 'Mock GD Practice'] },
        { title: 'Module 4: Corporate & Interview Communication', topics: ['Elevator Pitch (Tell Me About Yourself)', 'Behavioral Interview STAR Technique', 'Resume Walkthrough Strategies', 'Corporate Email Writing'] },
      ],
    },
    {
      title: 'Aptitude & Reasoning',
      slug: 'aptitude-reasoning',
      category: 'Placement Preparation',
      description: 'Comprehensive training for campus placement tests and competitive exams covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation.',
      duration: '6 Weeks (45 Hours)',
      trainer_id: staffInternalIds[2],
      skills_gained: ['Speed Math & Shortcuts', 'Quantitative Problem Solving', 'Logical Deduction', 'Verbal Logic & Critical Reading', 'Data Interpretation', 'Placement Exam Strategies'],
      modules: [
        { title: 'Module 1: Quantitative Aptitude I', topics: ['Number Systems & Divisibility', 'Percentages & Profit/Loss', 'Ratio, Proportion & Averages', 'Simple & Compound Interest'] },
        { title: 'Module 2: Quantitative Aptitude II', topics: ['Time, Speed & Distance', 'Time & Work / Pipes & Cisterns', 'Permutations, Combinations & Probability', 'Mensuration & Geometry'] },
        { title: 'Module 3: Logical & Analytical Reasoning', topics: ['Blood Relations & Direction Sense', 'Seating Arrangements & Puzzles', 'Syllogisms & Coding-Decoding', 'Data Sufficiency'] },
        { title: 'Module 4: Verbal Ability & Data Interpretation', topics: ['Reading Comprehension', 'Sentence Correction & Para Jumbles', 'Tables, Bar Charts & Pie Charts', 'Mock Placement Tests'] },
      ],
    },
    {
      title: 'MS Excel - Basic to Advanced',
      slug: 'ms-excel',
      category: 'Data & Productivity',
      description: 'Master spreadsheet modeling, formula engineering, XLOOKUP/VLOOKUP, Pivot Tables, Power Query automation, data cleaning, and dynamic business reporting dashboards.',
      duration: '4 Weeks (30 Hours)',
      trainer_id: staffInternalIds[1],
      skills_gained: ['Formula Engineering', 'XLOOKUP / INDEX-MATCH', 'Pivot Tables & Slicers', 'Data Cleaning & Validation', 'Power Query Automation', 'Interactive Charts', 'Financial Modeling Basics'],
      modules: [
        { title: 'Module 1: Excel Fundamentals & Formulas', topics: ['Grid Navigation & Formatting', 'Relative vs Absolute References', 'Logical Functions (IF, AND, OR, IFS)', 'Text & Date Functions'] },
        { title: 'Module 2: Lookup & Reference Functions', topics: ['VLOOKUP & HLOOKUP Mastery', 'XLOOKUP & Modern Formula Array', 'INDEX & MATCH Combinations', 'Data Validation & Error Handling'] },
        { title: 'Module 3: Pivot Tables & Data Analysis', topics: ['Pivot Tables Creation & Grouping', 'Calculated Fields & Slicers', 'Conditional Formatting', 'Interactive Trend Charts'] },
        { title: 'Module 4: Advanced Excel & Power Query', topics: ['Importing Multi-source Data', 'Power Query Transformations', 'What-If Analysis & Goal Seek', 'Executive Dashboard Project'] },
      ],
    },
    {
      title: 'Power BI & Business Intelligence',
      slug: 'power-bi',
      category: 'Data & Analytics',
      description: 'Become a certified Business Intelligence Specialist. Learn Power Query ETL, relational data modeling (Star Schema), DAX calculations, and interactive executive dashboards.',
      duration: '6 Weeks (45 Hours)',
      trainer_id: staffInternalIds[1],
      skills_gained: ['Power Query ETL', 'Star Schema Data Modeling', 'DAX Measures & Calculated Columns', 'Interactive Visualizations', 'Drill-through & Tooltips', 'Power BI Service & Gateway', 'End-to-End Analytics Projects'],
      modules: [
        { title: 'Module 1: Power BI Desktop Architecture', topics: ['BI Landscape & Ecosystem', 'Connecting to CSV, SQL, Excel', 'Power Query ETL Transformations', 'Unpivoting & Data Cleaning'] },
        { title: 'Module 2: Relational Data Modeling', topics: ['Fact vs Dimension Tables', 'Star Schema Design', 'Managing Relationships (1:M, M:M)', 'Role-playing Dimensions'] },
        { title: 'Module 3: DAX (Data Analysis Expressions)', topics: ['Calculated Columns vs Measures', 'CALCULATE & Filter Context', 'Time Intelligence (YTD, MoM, YoY)', 'Iterator Functions (SUMX, AVERAGEX)'] },
        { title: 'Module 4: Visuals & Executive Dashboards', topics: ['Custom Visuals & KPI Cards', 'Bookmarks, Selection & Navigation', 'Drill-through & Custom Tooltips', 'Capstone End-to-End BI Project'] },
      ],
    },
  ];

  const courseInternalIds: number[] = [];
  for (const c of coursesData) {
    const res = db.prepare(`
      INSERT INTO courses (title, slug, category, description, duration, skills_gained, modules, trainer_id, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      c.title,
      c.slug,
      c.category,
      c.description,
      c.duration,
      JSON.stringify(c.skills_gained),
      JSON.stringify(c.modules),
      c.trainer_id
    );
    courseInternalIds.push(Number(res.lastInsertRowid));
  }

  // 5. Create 3 Batches
  const batchesData = [
    {
      name: 'JAVA-2026-A',
      course_id: courseInternalIds[0],
      trainer_id: staffInternalIds[0],
      start_date: '2026-08-01',
      end_date: '2026-09-30',
      timing: 'Mon-Fri, 09:00 AM - 11:00 AM',
      students: [studentInternalIds[0], studentInternalIds[1], studentInternalIds[2], studentInternalIds[3]],
    },
    {
      name: 'POWERBI-2026-B',
      course_id: courseInternalIds[4],
      trainer_id: staffInternalIds[1],
      start_date: '2026-08-10',
      end_date: '2026-09-25',
      timing: 'Mon-Fri, 02:00 PM - 04:00 PM',
      students: [studentInternalIds[3], studentInternalIds[4], studentInternalIds[5], studentInternalIds[9]],
    },
    {
      name: 'APTITUDE-2026-A',
      course_id: courseInternalIds[2],
      trainer_id: staffInternalIds[2],
      start_date: '2026-08-05',
      end_date: '2026-09-18',
      timing: 'Tue-Sat, 05:00 PM - 07:00 PM',
      students: [studentInternalIds[6], studentInternalIds[7], studentInternalIds[8], studentInternalIds[0], studentInternalIds[1]],
    },
  ];

  const batchInternalIds: number[] = [];
  for (const b of batchesData) {
    const res = db.prepare(`
      INSERT INTO batches (name, course_id, trainer_id, start_date, end_date, timing)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(b.name, b.course_id, b.trainer_id, b.start_date, b.end_date, b.timing);
    const bId = Number(res.lastInsertRowid);
    batchInternalIds.push(bId);

    // Enroll students in batch & course
    b.students.forEach(stId => {
      db.prepare('INSERT OR IGNORE INTO batch_students (batch_id, student_id) VALUES (?, ?)').run(bId, stId);
      db.prepare('INSERT OR IGNORE INTO course_enrollments (course_id, student_id, status, progress) VALUES (?, ?, ?, ?)').run(
        b.course_id,
        stId,
        'active',
        Math.floor(Math.random() * 40) + 30
      );
    });
  }

  // Also enroll remaining students into various courses
  studentInternalIds.forEach((stId, idx) => {
    const courseId = courseInternalIds[idx % courseInternalIds.length];
    db.prepare('INSERT OR IGNORE INTO course_enrollments (course_id, student_id, status, progress) VALUES (?, ?, ?, ?)').run(
      courseId,
      stId,
      'active',
      50
    );
  });

  // 6. Create 5 Online Tests with Questions
  const testsData = [
    {
      title: 'Java Core & OOPs Assessment',
      subject: 'Java Programming',
      description: 'Test your understanding of Object-Oriented concepts, collections, inheritance, exception handling, and polymorphism in Java.',
      duration_minutes: 25,
      total_marks: 20,
      passing_marks: 12,
      course_id: courseInternalIds[0],
      batch_id: batchInternalIds[0],
      created_by: adminUserId,
      status: 'published',
      questions: [
        {
          question_text: 'Which feature of OOP allows a subclass to provide a specific implementation of a method that is already provided by its parent class?',
          question_type: 'mcq',
          option_a: 'Method Overloading',
          option_b: 'Method Overriding',
          option_c: 'Encapsulation',
          option_d: 'Abstraction',
          correct_answer: 'Method Overriding',
          marks: 2,
          explanation: 'Method overriding occurs when a child class defines a method with the same signature as a parent class method to provide specialized behavior.',
        },
        {
          question_text: 'Which collection class in Java allows duplicate elements and maintains insertion order?',
          question_type: 'mcq',
          option_a: 'HashSet',
          option_b: 'TreeSet',
          option_c: 'ArrayList',
          option_d: 'HashMap',
          correct_answer: 'ArrayList',
          marks: 2,
          explanation: 'ArrayList implements the List interface, which preserves insertion order and permits duplicates.',
        },
        {
          question_text: 'Can an interface in Java 8 or newer have method implementations using the `default` keyword?',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Java 8 introduced default and static methods in interfaces to enable backwards compatibility with lambdas.',
        },
        {
          question_text: 'What is the superclass of all classes in Java?',
          question_type: 'short_answer',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          correct_answer: 'Object',
          marks: 2,
          explanation: 'java.lang.Object is the ultimate root class of the entire class hierarchy in Java.',
        },
        {
          question_text: 'Which keyword is used to explicitly prevent method overriding and class inheritance in Java?',
          question_type: 'mcq',
          option_a: 'static',
          option_b: 'final',
          option_c: 'abstract',
          option_d: 'synchronized',
          correct_answer: 'final',
          marks: 2,
          explanation: 'A final method cannot be overridden, and a final class cannot be subclassed.',
        },
        {
          question_text: 'Which exception is thrown when an application attempts to use null in an object reference where an object is required?',
          question_type: 'mcq',
          option_a: 'ArithmeticException',
          option_b: 'NullPointerException',
          option_c: 'IllegalArgumentException',
          option_d: 'ClassNotFoundException',
          correct_answer: 'NullPointerException',
          marks: 2,
          explanation: 'NullPointerException is thrown when invoking a method or accessing a field on a null object reference.',
        },
        {
          question_text: 'Which interface in the Java Collections framework does NOT inherit from the Collection interface?',
          question_type: 'mcq',
          option_a: 'List',
          option_b: 'Set',
          option_c: 'Queue',
          option_d: 'Map',
          correct_answer: 'Map',
          marks: 2,
          explanation: 'Map operates on key-value pairs and constitutes its own independent hierarchy in java.util.',
        },
        {
          question_text: 'What does the JDBC statement executeQuery() return upon executing a SELECT SQL query?',
          question_type: 'mcq',
          option_a: 'int',
          option_b: 'ResultSet',
          option_c: 'boolean',
          option_d: 'Connection',
          correct_answer: 'ResultSet',
          marks: 2,
          explanation: 'executeQuery() returns a ResultSet object containing the rows produced by the database query.',
        },
        {
          question_text: 'Strings in Java are mutable objects.',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'False',
          marks: 2,
          explanation: 'Strings in Java are immutable. StringBuilder or StringBuffer are used when mutability is required.',
        },
        {
          question_text: 'Which memory area in the JVM holds objects instantiated with the `new` keyword?',
          question_type: 'mcq',
          option_a: 'Stack Memory',
          option_b: 'Heap Memory',
          option_c: 'Method Area',
          option_d: 'PC Register',
          correct_answer: 'Heap Memory',
          marks: 2,
          explanation: 'All object instances and array allocations are placed in the garbage-collected JVM Heap memory.',
        },
      ],
    },
    {
      title: 'Power BI DAX & Data Modeling Quiz',
      subject: 'Power BI',
      description: 'Evaluate your ability to construct Star Schemas, write DAX calculations, and configure relationships in Power BI Desktop.',
      duration_minutes: 20,
      total_marks: 16,
      passing_marks: 10,
      course_id: courseInternalIds[4],
      batch_id: batchInternalIds[1],
      created_by: staffInternalIds[1],
      status: 'published',
      questions: [
        {
          question_text: 'Which DAX function is the most fundamental for modifying the filter context of a calculation?',
          question_type: 'mcq',
          option_a: 'FILTER()',
          option_b: 'CALCULATE()',
          option_c: 'ALL()',
          option_d: 'SUMX()',
          correct_answer: 'CALCULATE()',
          marks: 2,
          explanation: 'CALCULATE evaluates an expression in a context modified by given filters.',
        },
        {
          question_text: 'In relational BI modeling, which schema design is recommended for high performance and clean relationships?',
          question_type: 'mcq',
          option_a: 'Star Schema',
          option_b: 'Flat Denormalized Table',
          option_c: 'Network Schema',
          option_d: 'Hierarchical Tree',
          correct_answer: 'Star Schema',
          marks: 2,
          explanation: 'Star Schema featuring central Fact tables connected to Dimension tables provides optimal query performance.',
        },
        {
          question_text: 'Calculated Columns in Power BI consume RAM memory during data model refresh.',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Calculated columns are evaluated row by row during refresh and stored in memory, unlike Measures which are dynamic.',
        },
        {
          question_text: 'Which Power BI tool is used for performing ETL (Extract, Transform, Load) transformations before loading into the model?',
          question_type: 'mcq',
          option_a: 'DAX Studio',
          option_b: 'Power Query Editor',
          option_c: 'Power Automate',
          option_d: 'Report Builder',
          correct_answer: 'Power Query Editor',
          marks: 2,
          explanation: 'Power Query (M language) handles data cleansing, filtering, merging, and reshaping.',
        },
        {
          question_text: 'Which function allows you to ignore existing filters on a column or table inside a CALCULATE expression?',
          question_type: 'mcq',
          option_a: 'REMOVE()',
          option_b: 'ALL()',
          option_c: 'CLEAR()',
          option_d: 'RESET()',
          correct_answer: 'ALL()',
          marks: 2,
          explanation: 'ALL() removes context filters applied to specified columns or tables.',
        },
        {
          question_text: 'Can a single active relationship exist between two tables in Power BI simultaneously?',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Only one active relationship can filter between two tables at a time; others must be inactive and invoked using USERELATIONSHIP.',
        },
        {
          question_text: 'Which DAX category includes functions like DATESYTD, SAMEPERIODLASTYEAR, and DATEADD?',
          question_type: 'mcq',
          option_a: 'Text Functions',
          option_b: 'Time Intelligence Functions',
          option_c: 'Logical Functions',
          option_d: 'Statistical Functions',
          correct_answer: 'Time Intelligence Functions',
          marks: 2,
          explanation: 'Time Intelligence functions allow comparison across historical periods, year-to-date, and rolling intervals.',
        },
        {
          question_text: 'What visual interaction element allows bookmarking views and creating navigation buttons on reports?',
          question_type: 'short_answer',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          correct_answer: 'Bookmarks',
          marks: 2,
          explanation: 'Bookmarks capture the current state of a report page including filters, slicers, and visual visibility.',
        },
      ],
    },
    {
      title: 'Quantitative Aptitude & Logical Reasoning',
      subject: 'Aptitude',
      description: 'Solve fast-paced quantitative problems, time and work calculations, ratios, permutations, and logical deduction puzzles.',
      duration_minutes: 20,
      total_marks: 16,
      passing_marks: 10,
      course_id: courseInternalIds[2],
      batch_id: batchInternalIds[2],
      created_by: staffInternalIds[2],
      status: 'published',
      questions: [
        {
          question_text: 'If a train traveling at 72 km/h crosses a 200-meter platform in 20 seconds, what is the length of the train in meters?',
          question_type: 'mcq',
          option_a: '150 m',
          option_b: '200 m',
          option_c: '250 m',
          option_d: '300 m',
          correct_answer: '200 m',
          marks: 2,
          explanation: 'Speed = 72 * (5/18) = 20 m/s. Total distance = speed * time = 20 * 20 = 400m. Train length = 400 - 200 = 200m.',
        },
        {
          question_text: 'A and B can complete a work in 12 days and 18 days respectively. Working together, in how many days will they finish the work?',
          question_type: 'mcq',
          option_a: '6.5 days',
          option_b: '7.2 days',
          option_c: '8.0 days',
          option_d: '9.5 days',
          correct_answer: '7.2 days',
          marks: 2,
          explanation: 'Work = (1/12) + (1/18) = (3+2)/36 = 5/36 per day. Time = 36/5 = 7.2 days.',
        },
        {
          question_text: 'What is 15% of 250 plus 25% of 150?',
          question_type: 'mcq',
          option_a: '65',
          option_b: '75',
          option_c: '80',
          option_d: '85',
          correct_answer: '75',
          marks: 2,
          explanation: '15% of 250 = 37.5; 25% of 150 = 37.5. 37.5 + 37.5 = 75.',
        },
        {
          question_text: 'In how many different ways can the letters of the word "LEADER" be arranged?',
          question_type: 'mcq',
          option_a: '360',
          option_b: '720',
          option_c: '180',
          option_d: '120',
          correct_answer: '360',
          marks: 2,
          explanation: 'Total letters = 6, E appears twice. Total arrangements = 6! / 2! = 720 / 2 = 360.',
        },
        {
          question_text: 'Pointing to a photograph, a man said: "She is the daughter of my grandfather\'s only son." Who is the woman to the man?',
          question_type: 'mcq',
          option_a: 'Mother',
          option_b: 'Sister',
          option_c: 'Aunt',
          option_d: 'Daughter',
          correct_answer: 'Sister',
          marks: 2,
          explanation: 'Grandfather\'s only son = Man\'s father. Daughter of father = Man\'s sister.',
        },
        {
          question_text: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
          question_type: 'mcq',
          option_a: '125',
          option_b: '127',
          option_c: '129',
          option_d: '131',
          correct_answer: '127',
          marks: 2,
          explanation: 'Each term is (previous * 2) + 1. 63 * 2 + 1 = 127.',
        },
        {
          question_text: 'A shopkeeper sells an item at 20% profit on cost price. If the cost price is ₹500, what is the selling price?',
          question_type: 'short_answer',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          correct_answer: '600',
          marks: 2,
          explanation: 'Selling price = 500 + (20% of 500) = 500 + 100 = 600.',
        },
        {
          question_text: 'Two dice are thrown simultaneously. What is the probability of obtaining a sum of 7?',
          question_type: 'mcq',
          option_a: '1/6',
          option_b: '1/12',
          option_c: '5/36',
          option_d: '7/36',
          correct_answer: '1/6',
          marks: 2,
          explanation: 'Favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Total = 36. Probability = 6/36 = 1/6.',
        },
      ],
    },
    {
      title: 'Advanced MS Excel Formulas & Pivot Tables',
      subject: 'MS Excel',
      description: 'Test your formula crafting, XLOOKUP, Nested IFs, Pivot table aggregations, and data analysis shortcuts.',
      duration_minutes: 20,
      total_marks: 16,
      passing_marks: 10,
      course_id: courseInternalIds[3],
      batch_id: null,
      created_by: adminUserId,
      status: 'published',
      questions: [
        {
          question_text: 'Which modern Excel function replaces both VLOOKUP and HLOOKUP with flexible bidirectional search without column index numbers?',
          question_type: 'mcq',
          option_a: 'LOOKUP2',
          option_b: 'XLOOKUP',
          option_c: 'SEARCHMATCH',
          option_d: 'FILTERINDEX',
          correct_answer: 'XLOOKUP',
          marks: 2,
          explanation: 'XLOOKUP searches any range or array and returns corresponding items from another array by default.',
        },
        {
          question_text: 'Which shortcut key freezes references in Excel formulas by toggling dollar signs ($A$1)?',
          question_type: 'mcq',
          option_a: 'F2',
          option_b: 'F4',
          option_c: 'F9',
          option_d: 'F12',
          correct_answer: 'F4',
          marks: 2,
          explanation: 'Pressing F4 while editing a cell reference cycles between relative, absolute, and mixed references.',
        },
        {
          question_text: 'Can Pivot Tables dynamically summarize non-numeric text data by calculating counts and distinct counts?',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Pivot Tables can aggregate categorical text using Count, Distinct Count, and percentage distributions.',
        },
        {
          question_text: 'Which function calculates the sum of cells matching multiple criteria across different ranges?',
          question_type: 'mcq',
          option_a: 'SUMIF',
          option_b: 'SUMIFS',
          option_c: 'MULTISUM',
          option_d: 'CONDITIONSUM',
          correct_answer: 'SUMIFS',
          marks: 2,
          explanation: 'SUMIFS takes sum_range first followed by multiple criteria_range and criteria pairs.',
        },
        {
          question_text: 'What character indicates a comment in VBA macro scripts in Excel?',
          question_type: 'short_answer',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          correct_answer: "'",
          marks: 2,
          explanation: "Single quote (') marks the beginning of a comment in VBA.",
        },
        {
          question_text: 'Which feature removes duplicate rows based on selected column criteria in a dataset?',
          question_type: 'mcq',
          option_a: 'Flash Fill',
          option_b: 'Remove Duplicates',
          option_c: 'Consolidate',
          option_d: 'Text to Columns',
          correct_answer: 'Remove Duplicates',
          marks: 2,
          explanation: 'Data > Remove Duplicates compares row values and removes redundant records.',
        },
        {
          question_text: 'What formula returns the current date and dynamic real-time timestamp in Excel?',
          question_type: 'mcq',
          option_a: '=TODAY()',
          option_b: '=NOW()',
          option_c: '=CURRENT()',
          option_d: '=DATE()',
          correct_answer: '=NOW()',
          marks: 2,
          explanation: '=NOW() returns both current date and time, whereas =TODAY() returns only the date.',
        },
        {
          question_text: 'Slicers can be connected to multiple Pivot Tables across different worksheets.',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Via Slicer Report Connections, a single slicer can filter multiple pivot tables simultaneously.',
        },
      ],
    },
    {
      title: 'Corporate Communication & Interview Readiness',
      subject: 'Communication Skills',
      description: 'Evaluate mastery of the STAR interview framework, active listening, business etiquette, and vocal pacing.',
      duration_minutes: 15,
      total_marks: 14,
      passing_marks: 9,
      course_id: courseInternalIds[1],
      batch_id: null,
      created_by: staffInternalIds[2],
      status: 'published',
      questions: [
        {
          question_text: 'What does the acronym STAR stand for in behavioral interview answers?',
          question_type: 'mcq',
          option_a: 'Strength, Target, Attitude, Results',
          option_b: 'Situation, Task, Action, Result',
          option_c: 'Strategy, Timing, Ability, Review',
          option_d: 'Skills, Training, Accomplishments, Roles',
          correct_answer: 'Situation, Task, Action, Result',
          marks: 2,
          explanation: 'STAR structured answers clearly describe the context, challenge, your personal actions, and measurable outcomes.',
        },
        {
          question_text: 'In formal business communication, what is considered an optimal response window for professional emails?',
          question_type: 'mcq',
          option_a: 'Within 24 to 48 hours',
          option_b: 'Within 10 minutes only',
          option_c: '1 to 2 weeks',
          option_d: 'No timeline required',
          correct_answer: 'Within 24 to 48 hours',
          marks: 2,
          explanation: 'Standard professional email etiquette expects replies within 24-48 business hours.',
        },
        {
          question_text: 'Maintaining natural eye contact and open posture conveys confidence during interviews.',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'True',
          marks: 2,
          explanation: 'Non-verbal cues like eye contact, nodding, and upright open posture communicate interest and self-assurance.',
        },
        {
          question_text: 'Which technique involves paraphrasing what a speaker said to verify understanding before answering?',
          question_type: 'mcq',
          option_a: 'Passive Listening',
          option_b: 'Active Listening',
          option_c: 'Selective Listening',
          option_d: 'Interruptive Dialogue',
          correct_answer: 'Active Listening',
          marks: 2,
          explanation: 'Active listening includes reflective restatement, validation, and asking clarifying questions.',
        },
        {
          question_text: 'In a Group Discussion (GD), interrupting others aggressively will earn high leadership marks.',
          question_type: 'true_false',
          option_a: 'True',
          option_b: 'False',
          option_c: null,
          option_d: null,
          correct_answer: 'False',
          marks: 2,
          explanation: 'GD evaluators penalize aggressive interruptions and reward collaborative moderation, respectful turn-taking, and reasoned inputs.',
        },
        {
          question_text: 'What should be the typical duration of an initial self-introduction (Elevator Pitch) in an interview?',
          question_type: 'mcq',
          option_a: '60 to 90 seconds',
          option_b: '10 to 15 minutes',
          option_c: '5 seconds',
          option_d: '30 minutes',
          correct_answer: '60 to 90 seconds',
          marks: 2,
          explanation: 'A concise 60-90 second introduction highlights your education, key projects, core technical skills, and career passion.',
        },
        {
          question_text: 'Which voice modulation aspect refers to the highness or lowness of vocal tone when emphasizing important points?',
          question_type: 'short_answer',
          option_a: null,
          option_b: null,
          option_c: null,
          option_d: null,
          correct_answer: 'Pitch',
          marks: 2,
          explanation: 'Pitch variation adds dynamism and prevents a monotonous delivery.',
        },
      ],
    },
  ];

  const testInternalIds: number[] = [];
  for (const t of testsData) {
    const res = db.prepare(`
      INSERT INTO tests (
        title, subject, description, duration_minutes, total_marks, passing_marks,
        course_id, batch_id, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.title,
      t.subject,
      t.description,
      t.duration_minutes,
      t.total_marks,
      t.passing_marks,
      t.course_id,
      t.batch_id,
      t.created_by,
      t.status
    );

    const testId = Number(res.lastInsertRowid);
    testInternalIds.push(testId);

    t.questions.forEach((q, idx) => {
      db.prepare(`
        INSERT INTO questions (
          test_id, question_text, question_type, option_a, option_b, option_c, option_d,
          correct_answer, marks, explanation, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        testId,
        q.question_text,
        q.question_type,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.marks,
        q.explanation,
        idx
      );
    });
  }

  // 7. Create Sample Test Attempts & Results for first few students
  const sampleAttempts = [
    { test_id: testInternalIds[0], student_id: studentInternalIds[0], score: 18, total_marks: 20, percentage: 90, passed: 1 },
    { test_id: testInternalIds[0], student_id: studentInternalIds[1], score: 16, total_marks: 20, percentage: 80, passed: 1 },
    { test_id: testInternalIds[0], student_id: studentInternalIds[2], score: 14, total_marks: 20, percentage: 70, passed: 1 },
    { test_id: testInternalIds[1], student_id: studentInternalIds[3], score: 14, total_marks: 16, percentage: 87.5, passed: 1 },
    { test_id: testInternalIds[1], student_id: studentInternalIds[4], score: 12, total_marks: 16, percentage: 75, passed: 1 },
    { test_id: testInternalIds[2], student_id: studentInternalIds[0], score: 14, total_marks: 16, percentage: 87.5, passed: 1 },
    { test_id: testInternalIds[2], student_id: studentInternalIds[6], score: 10, total_marks: 16, percentage: 62.5, passed: 1 },
  ];

  for (const att of sampleAttempts) {
    db.prepare(`
      INSERT INTO test_attempts (test_id, student_id, score, total_marks, percentage, passed, status, submitted_at, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP, '[]')
    `).run(att.test_id, att.student_id, att.score, att.total_marks, att.percentage, att.passed);
  }

  // 8. Create Sample Attendance records for multiple days
  const dates = ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14'];
  batchInternalIds.forEach(batchId => {
    const studentsInBatch = db.prepare('SELECT student_id FROM batch_students WHERE batch_id = ?').all(batchId) as any[];
    dates.forEach(d => {
      studentsInBatch.forEach((st, sIdx) => {
        // Mostly present, occasional absent/leave
        let status = 'present';
        if ((sIdx + d.charCodeAt(9)) % 7 === 0) status = 'absent';
        else if ((sIdx + d.charCodeAt(9)) % 11 === 0) status = 'leave';

        db.prepare(`
          INSERT OR IGNORE INTO attendance (batch_id, student_id, date, status, remarks, marked_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(batchId, st.student_id, d, status, status === 'present' ? 'Attended on time' : 'Informed leave', adminUserId);
      });
    });
  });

  // 9. Create 6 Internship Programs
  const internshipPrograms = [
    {
      title: 'Full-Stack Java Enterprise Internship',
      domain: 'Java Development',
      description: 'Build enterprise-grade microservices and secure full-stack applications with Java 17, Spring Boot, PostgreSQL, and modern React frontends.',
      duration: '3 Months (Live Industry Projects)',
      eligibility: 'B.Tech / B.E. / MCA / B.Sc students with fundamental Java or Object-Oriented concepts.',
      skills_required: ['Java OOPs', 'Spring Framework Basics', 'REST APIs', 'SQL Database Design', 'Git & GitHub'],
      learning_outcomes: ['Design Scalable Microservices Architecture', 'Secure JWT Auth & API Gateway', 'Hibernate ORM & Migration Tools', 'Docker Containerization & Deployment'],
      projects: ['FinTech Banking & Transaction Portal', 'Healthcare Patient EMR System', 'Enterprise Asset Management API'],
    },
    {
      title: 'Business Analytics & Power BI Internship',
      domain: 'Power BI',
      description: 'Transform raw enterprise data into executive business intelligence dashboards, advanced DAX modeling, and automated KPI reporting suites.',
      duration: '3 Months (Hands-on Corporate Datasets)',
      eligibility: 'Pre-final and Final year engineering, science, or management students with analytical mindset.',
      skills_required: ['Data Analysis Basics', 'MS Excel Formulas', 'Problem Solving', 'Data Visualization Interest'],
      learning_outcomes: ['Power Query ETL Pipelines', 'Star Schema & Relational Modeling', 'Complex DAX & Time-Intelligence Measures', 'Publishing to Power BI Service with Row-Level Security'],
      projects: ['E-Commerce Sales Performance Suite', 'Supply Chain Logistics Live Tracker', 'Global Financial Revenue Dashboard'],
    },
    {
      title: 'Applied AI & Data Science Internship',
      domain: 'AI & Data Science',
      description: 'Implement machine learning models, exploratory statistical analysis, natural language processing pipelines, and AI-driven predictive systems.',
      duration: '3 Months (Real Datasets)',
      eligibility: 'Students interested in Python, statistics, predictive modeling, and applied artificial intelligence.',
      skills_required: ['Python Basics', 'Pandas & NumPy', 'Basic Linear Algebra', 'Analytical Thinking'],
      learning_outcomes: ['Data Preprocessing & Feature Engineering', 'Supervised & Unsupervised ML Algorithms', 'Deep Learning with PyTorch / TensorFlow', 'Model Deployment via FastAPI'],
      projects: ['Customer Churn Prediction Engine', 'Resume Screening AI Agent', 'Real-Time Fraud Detection Model'],
    },
    {
      title: 'Modern Web & Full-Stack Development Internship',
      domain: 'Web Development',
      description: 'Develop fast, accessible, responsive web applications using TypeScript, React 18, Tailwind CSS, Node.js, and cloud backend integrations.',
      duration: '3 Months',
      eligibility: 'Students passionate about frontend engineering and modern web technologies.',
      skills_required: ['HTML, CSS, JavaScript', 'React Basics', 'Component Design', 'Git Version Control'],
      learning_outcomes: ['State Management & Custom Hooks', 'Full-stack REST & GraphQL APIs', 'Performance Optimization & Lighthouse 95+', 'Cloud CI/CD & Deployment'],
      projects: ['Collaborative Project Management Workspace', 'Interactive Learning Portal', 'SaaS Subscription Billing Dashboard'],
    },
    {
      title: 'Data Analytics & Business Intelligence Internship',
      domain: 'Data Analytics',
      description: 'Master the end-to-end data analytics workflow: SQL querying, exploratory Python modeling, Tableau/Power BI visualization, and executive business storytelling.',
      duration: '3 Months',
      eligibility: 'All degrees and branches with interest in data-driven decision making.',
      skills_required: ['SQL Basics', 'Excel', 'Logical Thinking', 'Communication Skills'],
      learning_outcomes: ['Advanced SQL Joins & Window Functions', 'Python Data Wrangling (Pandas/Seaborn)', 'Business Metric KPI Formulation', 'Executive Stakeholder Storytelling'],
      projects: ['Retail Customer Segmentation Study', 'Hospital Patient Inflow Optimizer', 'Marketing Campaign ROI Analytics'],
    },
    {
      title: 'Business & Operations Analytics Internship',
      domain: 'Business/Data Analytics',
      description: 'Bridge business strategy with operational data analysis, spreadsheet modeling, financial forecasting, and management decision frameworks.',
      duration: '3 Months',
      eligibility: 'Students from Commerce, Management, or Engineering disciplines.',
      skills_required: ['MS Excel', 'Critical Thinking', 'Business Acumen', 'Presentation Skills'],
      learning_outcomes: ['Financial Projections & Sensitivity Models', 'Process Optimization & Workflow Mapping', 'Data-driven Strategy Formulation', 'C-Level Presentation Decks'],
      projects: ['Product Pricing Optimization Model', 'Inventory Cost Reduction Blueprint', 'Market Expansion Feasibility Study'],
    },
  ];

  for (const p of internshipPrograms) {
    db.prepare(`
      INSERT INTO internships (
        title, domain, description, duration, eligibility, skills_required, learning_outcomes, projects, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      p.title,
      p.domain,
      p.description,
      p.duration,
      p.eligibility,
      JSON.stringify(p.skills_required),
      JSON.stringify(p.learning_outcomes),
      JSON.stringify(p.projects)
    );
  }

  // 10. Sample Internship Applications
  const sampleApplications = [
    {
      domain: 'Java Development',
      student_id: studentInternalIds[0],
      name: 'Aakash Patel',
      email: 'aakash.patel@gmail.com',
      mobile: '+91 98200 11221',
      college: 'National Institute of Engineering',
      degree: 'B.Tech',
      dept: 'Computer Science',
      year: '3rd Year',
      status: 'shortlisted',
      motivation: 'I want to build high-scale enterprise Java microservices and contribute to real-world client products under expert mentorship.',
      admin_feedback: 'Strong Java foundation and 90% score in OOPs assessment. Invited for technical discussion.',
    },
    {
      domain: 'Power BI',
      student_id: studentInternalIds[3],
      name: 'Divya Iyer',
      email: 'divya.iyer@gmail.com',
      mobile: '+91 98200 11224',
      college: 'SRM Institute of Science and Technology',
      degree: 'B.Tech',
      dept: 'Data Science & AI',
      year: '4th Year',
      status: 'under_review',
      motivation: 'Passionate about executive dashboard design and DAX modeling. Looking for industry exposure in business intelligence.',
      admin_feedback: 'Application under review with analytics lead.',
    },
    {
      domain: 'Data Analytics',
      student_id: studentInternalIds[1],
      name: 'Sneha Reddy',
      email: 'sneha.reddy@gmail.com',
      mobile: '+91 98200 11222',
      college: 'Vellore Institute of Technology',
      degree: 'B.Tech',
      dept: 'Information Technology',
      year: '4th Year',
      status: 'applied',
      motivation: 'Eager to apply SQL and statistical data modeling to solve business analytics challenges.',
      admin_feedback: null,
    },
  ];

  for (const app of sampleApplications) {
    db.prepare(`
      INSERT INTO internship_applications (
        domain, student_id, full_name, email, mobile, college, degree, department,
        year_of_study, motivation, status, admin_feedback
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      app.domain,
      app.student_id,
      app.name,
      app.email,
      app.mobile,
      app.college,
      app.degree,
      app.dept,
      app.year,
      app.motivation,
      app.status,
      app.admin_feedback
    );
  }

  // 11. Sample Announcements
  const sampleAnnouncements = [
    {
      title: '🚀 Grand Launch of MindMend Campus Placement Bootcamps',
      content: 'We are thrilled to announce our 2026 Intensive Placement Training Series with mock interview panels, live coding rounds, and direct hiring partner referrals.',
      target_type: 'all',
      target_id: null,
      created_by: adminUserId,
    },
    {
      title: '📅 JAVA-2026-A: Spring Framework & JDBC Hands-on Lab',
      content: 'Tomorrow’s session will cover JDBC Connection Pooling and PreparedStatement transactions. Please keep your local MySQL database running.',
      target_type: 'batch',
      target_id: batchInternalIds[0],
      created_by: staffInternalIds[0],
    },
    {
      title: '💡 Power BI DAX Workshop this Saturday',
      content: 'Special masterclass on Time-Intelligence and CALCULATE filter context this Saturday at 11:00 AM. Attendance is mandatory for enrolled students.',
      target_type: 'batch',
      target_id: batchInternalIds[1],
      created_by: staffInternalIds[1],
    },
  ];

  for (const ann of sampleAnnouncements) {
    db.prepare(`
      INSERT INTO announcements (title, content, target_type, target_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(ann.title, ann.content, ann.target_type, ann.target_id, ann.created_by);
  }

  // 12. Testimonials
  const testimonials = [
    {
      name: 'Aditya Sharma',
      role: 'Associate Software Engineer',
      company_or_college: 'Placed at Infosys via MindMend',
      content: 'The Java and Aptitude training at MindMend was the turning point in my campus placement. The practical coding tests and mock interviews prepared me thoroughly.',
      rating: 5,
    },
    {
      name: 'Meera Krishnan',
      role: 'Business Intelligence Analyst',
      company_or_college: 'Placed at Deloitte',
      content: 'Learning Power BI and Advanced Excel from industry experts helped me build a portfolio of real dashboards that impressed my interviewers.',
      rating: 5,
    },
    {
      name: 'Tanmay Kulkarni',
      role: 'Data Analytics Intern',
      company_or_college: 'MindMend Internship Graduate',
      content: 'The 3-month internship gave me real client project experience. Mentors reviewed my code daily and guided my career choices.',
      rating: 5,
    },
  ];

  for (const tm of testimonials) {
    db.prepare(`
      INSERT INTO testimonials (name, role, company_or_college, content, rating, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(tm.name, tm.role, tm.company_or_college, tm.content, tm.rating);
  }

  // 13. Contact Inquiries
  const sampleContacts = [
    {
      name: 'Prof. S. Ranganathan',
      email: 'hod.cse@rit.edu',
      phone: '+91 94432 10987',
      subject: 'College Campus Training Collaboration for 2026 Batch',
      message: 'We would like to partner with MindMend Academy to conduct full-stack Java and Aptitude training for 180 final year students at our campus.',
      status: 'new',
    },
    {
      name: 'Gaurav Mehta',
      email: 'gaurav.m@gmail.com',
      phone: '+91 98111 22334',
      subject: 'Query regarding Weekend Power BI Batch',
      message: 'Is there a weekend-only batch available for working professionals in Data Analytics?',
      status: 'replied',
    },
  ];

  for (const c of sampleContacts) {
    db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(c.name, c.email, c.phone, c.subject, c.message, c.status);
  }

  console.log('✅ MindMend Database successfully seeded with full realistic dataset!');
}

// Run standalone if executed directly
if (process.argv[1]?.includes('seedData')) {
  seedDatabase();
}
