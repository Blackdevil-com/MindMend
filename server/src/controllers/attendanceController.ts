import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const markBatchAttendance = (req: AuthRequest, res: Response) => {
  try {
    const { batch_id, date, records } = req.body;

    if (!batch_id || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Batch ID, date, and attendance records array are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO attendance (batch_id, student_id, date, status, remarks, marked_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(batch_id, student_id, date) DO UPDATE SET
        status = excluded.status,
        remarks = excluded.remarks,
        marked_by = excluded.marked_by,
        created_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      for (const rec of records) {
        if (rec.student_id && ['present', 'absent', 'leave'].includes(rec.status)) {
          upsertStmt.run(
            batch_id,
            rec.student_id,
            date,
            rec.status,
            rec.remarks || null,
            req.user!.id
          );
        }
      }
    });

    transaction();

    return res.json({ message: 'Attendance marked successfully' });
  } catch (error: any) {
    console.error('Error in markBatchAttendance:', error);
    return res.status(500).json({ error: 'Failed to record attendance' });
  }
};

export const getBatchAttendanceForDate = (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const { date } = req.query;

    const targetDate = (date as string) || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const batch = db.prepare(`
      SELECT b.*, c.title as course_title, st.full_name as trainer_name
      FROM batches b
      JOIN courses c ON b.course_id = c.id
      LEFT JOIN staff st ON b.trainer_id = st.id
      WHERE b.id = ?
    `).get(batchId) as any;

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Get all students enrolled in this batch and their attendance status for this date
    const students = db.prepare(`
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.email,
        s.mobile,
        COALESCE(a.status, 'present') as status,
        a.remarks,
        (SELECT COUNT(*) FROM attendance att WHERE att.student_id = s.id AND att.batch_id = ? AND att.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendance att WHERE att.student_id = s.id AND att.batch_id = ?) as total_days_recorded
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      LEFT JOIN attendance a ON a.student_id = s.id AND a.batch_id = ? AND a.date = ?
      WHERE bs.batch_id = ?
      ORDER BY s.student_id ASC
    `).all(batchId, batchId, batchId, targetDate, batchId) as any[];

    return res.json({
      batch,
      date: targetDate,
      students,
    });
  } catch (error: any) {
    console.error('Error in getBatchAttendanceForDate:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance roster' });
  }
};

export const getStudentAttendanceHistory = (req: AuthRequest, res: Response) => {
  try {
    let studentId: number;

    if (req.user?.role === 'student') {
      const st = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id) as any;
      if (!st) return res.status(404).json({ error: 'Student not found' });
      studentId = st.id;
    } else {
      studentId = Number(req.params.studentId);
    }

    const records = db.prepare(`
      SELECT 
        a.*,
        b.name as batch_name,
        c.title as course_title
      FROM attendance a
      JOIN batches b ON a.batch_id = b.id
      JOIN courses c ON b.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
    `).all(studentId);

    const totalDays = records.length;
    const presentDays = records.filter((r: any) => r.status === 'present').length;
    const absentDays = records.filter((r: any) => r.status === 'absent').length;
    const leaveDays = records.filter((r: any) => r.status === 'leave').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return res.json({
      records,
      summary: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        leave_days: leaveDays,
        percentage,
      },
    });
  } catch (error: any) {
    console.error('Error in getStudentAttendanceHistory:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance history' });
  }
};

export const getGlobalAttendanceReports = (req: Request, res: Response) => {
  try {
    const batches = db.prepare(`
      SELECT 
        b.id,
        b.name,
        c.title as course_title,
        st.full_name as trainer_name,
        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) as student_count,
        (SELECT COUNT(*) FROM attendance a WHERE a.batch_id = b.id) as total_attendance_entries,
        (SELECT COUNT(*) FROM attendance a WHERE a.batch_id = b.id AND a.status = 'present') as present_entries
      FROM batches b
      JOIN courses c ON b.course_id = c.id
      LEFT JOIN staff st ON b.trainer_id = st.id
      ORDER BY b.id ASC
    `).all() as any[];

    const batchStats = batches.map(b => {
      const percentage = b.total_attendance_entries > 0 
        ? Math.round((b.present_entries / b.total_attendance_entries) * 100) 
        : 0;
      return {
        ...b,
        attendance_percentage: percentage,
      };
    });

    // Overall global stats
    const totalEntries = db.prepare('SELECT COUNT(*) as count FROM attendance').get() as any;
    const presentEntries = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE status = 'present'").get() as any;
    const globalRate = totalEntries.count > 0 ? Math.round((presentEntries.count / totalEntries.count) * 100) : 0;

    return res.json({
      batches: batchStats,
      global: {
        total_records: totalEntries.count,
        present_records: presentEntries.count,
        overall_attendance_rate: globalRate,
      },
    });
  } catch (error: any) {
    console.error('Error in getGlobalAttendanceReports:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance reports' });
  }
};

export const exportAttendanceCSV = (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const records = db.prepare(`
      SELECT 
        s.student_id,
        s.full_name,
        b.name as batch_name,
        a.date,
        a.status,
        a.remarks
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN batches b ON a.batch_id = b.id
      WHERE (a.batch_id = ? OR ? = 'all')
      ORDER BY a.date DESC, s.student_id ASC
    `).all(batchId, batchId) as any[];

    const headers = ['Student ID', 'Full Name', 'Batch', 'Date', 'Status', 'Remarks'];
    const rows = records.map(r => [
      `"${r.student_id}"`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"${r.batch_name}"`,
      `"${r.date}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.remarks || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    return res.send(csvContent);
  } catch (error: any) {
    console.error('Error in exportAttendanceCSV:', error);
    return res.status(500).json({ error: 'Failed to export attendance' });
  }
};

export const getBatchAttendanceStats = (req: Request, res: Response) => {
  try {
    const { batch_id } = req.query;
    if (!batch_id) {
      return res.status(400).json({ error: 'Batch ID is required' });
    }

    const studentsStats = db.prepare(`
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = ? AND a.status = 'present') as present_days,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = ? AND a.status = 'absent') as absent_days,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = ? AND a.status = 'leave') as leave_days,
        (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.batch_id = ?) as total_days
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      WHERE bs.batch_id = ?
      ORDER BY s.student_id ASC
    `).all(batch_id, batch_id, batch_id, batch_id, batch_id);

    return res.json({ batch_stats: studentsStats });
  } catch (error: any) {
    console.error('Error in getBatchAttendanceStats:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance statistics' });
  }
};
