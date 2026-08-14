import { Request, Response } from 'express';
import { db } from '../config/database.js';

export const getAllBatches = (req: Request, res: Response) => {
  try {
    const { course_id, trainer_id } = req.query;

    let query = `
      SELECT 
        b.*,
        c.title as course_title,
        c.category as course_category,
        st.full_name as trainer_name,
        st.staff_id as trainer_staff_id,
        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) as student_count,
        (SELECT COUNT(*) FROM tests t WHERE t.batch_id = b.id) as tests_count
      FROM batches b
      JOIN courses c ON b.course_id = c.id
      LEFT JOIN staff st ON b.trainer_id = st.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (course_id) {
      query += ` AND b.course_id = ?`;
      params.push(course_id);
    }
    if (trainer_id) {
      query += ` AND b.trainer_id = ?`;
      params.push(trainer_id);
    }

    query += ` ORDER BY b.id DESC`;

    const batches = db.prepare(query).all(...params);
    return res.json({ batches });
  } catch (error: any) {
    console.error('Error in getAllBatches:', error);
    return res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

export const getBatchById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const batch = db.prepare(`
      SELECT 
        b.*,
        c.title as course_title,
        c.duration as course_duration,
        st.full_name as trainer_name,
        st.phone as trainer_phone,
        st.email as trainer_email
      FROM batches b
      JOIN courses c ON b.course_id = c.id
      LEFT JOIN staff st ON b.trainer_id = st.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get enrolled students with their performance stats
    const students = db.prepare(`
      SELECT 
        s.*,
        bs.enrolled_at as batch_enrolled_at,
        (SELECT ROUND(AVG(ta.percentage), 1) FROM test_attempts ta WHERE ta.student_id = s.id AND ta.status = 'submitted') as avg_score,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = b.id AND a.status = 'present') as present_days,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = b.id) as total_attendance_days
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      JOIN batches b ON bs.batch_id = b.id
      WHERE bs.batch_id = ?
      ORDER BY s.student_id ASC
    `).all(batch.id);

    // Tests assigned to this batch
    const tests = db.prepare(`
      SELECT t.*, (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questions_count
      FROM tests t
      WHERE t.batch_id = ?
      ORDER BY t.id DESC
    `).all(batch.id);

    return res.json({ batch, students, tests });
  } catch (error: any) {
    console.error('Error in getBatchById:', error);
    return res.status(500).json({ error: 'Failed to retrieve batch details' });
  }
};

export const createBatch = (req: Request, res: Response) => {
  try {
    const { name, course_id, trainer_id, start_date, end_date, timing, student_ids } = req.body;

    if (!name || !course_id || !start_date || !end_date || !timing) {
      return res.status(400).json({ error: 'Batch name, course, start/end dates, and timing are required' });
    }

    const existing = db.prepare('SELECT id FROM batches WHERE name = ?').get(name.trim());
    if (existing) {
      return res.status(400).json({ error: 'A batch with this name already exists' });
    }

    const insertBatch = db.prepare(`
      INSERT INTO batches (name, course_id, trainer_id, start_date, end_date, timing)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertBatch.run(
      name.trim(),
      course_id,
      trainer_id || null,
      start_date,
      end_date,
      timing.trim()
    );

    const batchId = Number(result.lastInsertRowid);

    // If students were provided, enroll them
    if (Array.isArray(student_ids) && student_ids.length > 0) {
      const insertStudent = db.prepare('INSERT OR IGNORE INTO batch_students (batch_id, student_id) VALUES (?, ?)');
      const insertEnrollment = db.prepare(`
        INSERT OR IGNORE INTO course_enrollments (course_id, student_id, status, progress) 
        VALUES (?, ?, 'active', 0)
      `);

      student_ids.forEach((sId: number) => {
        insertStudent.run(batchId, sId);
        insertEnrollment.run(course_id, sId);
      });
    }

    return res.status(201).json({
      message: 'Batch created successfully',
      batch_id: batchId,
    });
  } catch (error: any) {
    console.error('Error in createBatch:', error);
    return res.status(500).json({ error: 'Failed to create batch' });
  }
};

export const updateBatch = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, course_id, trainer_id, start_date, end_date, timing } = req.body;

    const existing = db.prepare('SELECT id FROM batches WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    db.prepare(`
      UPDATE batches
      SET name = COALESCE(?, name),
          course_id = COALESCE(?, course_id),
          trainer_id = COALESCE(?, trainer_id),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          timing = COALESCE(?, timing)
      WHERE id = ?
    `).run(name, course_id, trainer_id, start_date, end_date, timing, id);

    return res.json({ message: 'Batch updated successfully' });
  } catch (error: any) {
    console.error('Error in updateBatch:', error);
    return res.status(500).json({ error: 'Failed to update batch' });
  }
};

export const deleteBatch = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM batches WHERE id = ?').run(id);
    return res.json({ message: 'Batch deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteBatch:', error);
    return res.status(500).json({ error: 'Failed to delete batch' });
  }
};

export const addStudentsToBatch = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of student IDs' });
    }

    const batch = db.prepare('SELECT course_id FROM batches WHERE id = ?').get(id) as any;
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const insertBatchStudent = db.prepare('INSERT OR IGNORE INTO batch_students (batch_id, student_id) VALUES (?, ?)');
    const insertEnrollment = db.prepare(`
      INSERT OR IGNORE INTO course_enrollments (course_id, student_id, status, progress) 
      VALUES (?, ?, 'active', 0)
    `);

    const transaction = db.transaction(() => {
      for (const sId of student_ids) {
        insertBatchStudent.run(id, sId);
        insertEnrollment.run(batch.course_id, sId);
      }
    });

    transaction();

    return res.json({ message: `${student_ids.length} student(s) added to batch successfully` });
  } catch (error: any) {
    console.error('Error in addStudentsToBatch:', error);
    return res.status(500).json({ error: 'Failed to add students to batch' });
  }
};

export const removeStudentFromBatch = (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    db.prepare('DELETE FROM batch_students WHERE batch_id = ? AND student_id = ?').run(id, studentId);
    return res.json({ message: 'Student removed from batch successfully' });
  } catch (error: any) {
    console.error('Error in removeStudentFromBatch:', error);
    return res.status(500).json({ error: 'Failed to remove student from batch' });
  }
};
