import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllTests = (req: AuthRequest, res: Response) => {
  try {
    const { subject, batch_id, status } = req.query;

    let query = `
      SELECT 
        t.*,
        c.title as course_title,
        b.name as batch_name,
        u.email as creator_email,
        (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questions_count,
        (SELECT COUNT(*) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.status = 'submitted') as submissions_count,
        (SELECT ROUND(AVG(ta.percentage), 1) FROM test_attempts ta WHERE ta.test_id = t.id AND ta.status = 'submitted') as avg_percentage
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN batches b ON t.batch_id = b.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (subject) {
      query += ` AND t.subject LIKE ?`;
      params.push(`%${subject}%`);
    }
    if (batch_id) {
      query += ` AND t.batch_id = ?`;
      params.push(batch_id);
    }
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.id DESC`;

    const tests = db.prepare(query).all(...params);
    return res.json({ tests });
  } catch (error: any) {
    console.error('Error in getAllTests:', error);
    return res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

export const getTestById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const test = db.prepare(`
      SELECT 
        t.*,
        c.title as course_title,
        b.name as batch_name
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN batches b ON t.batch_id = b.id
      WHERE t.id = ?
    `).get(id) as any;

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const questions = db.prepare(`
      SELECT * FROM questions WHERE test_id = ? ORDER BY order_index ASC, id ASC
    `).all(test.id);

    return res.json({ test, questions });
  } catch (error: any) {
    console.error('Error in getTestById:', error);
    return res.status(500).json({ error: 'Failed to retrieve test details' });
  }
};

export const createTest = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check staff permission if user is staff
    if (req.user.role === 'staff') {
      const staff = db.prepare('SELECT can_create_tests FROM staff WHERE user_id = ?').get(req.user.id) as any;
      if (!staff || !staff.can_create_tests) {
        return res.status(403).json({ error: 'You do not have permission to create tests. Please contact the administrator.' });
      }
    }

    const {
      title,
      subject,
      description,
      duration_minutes,
      total_marks,
      passing_marks,
      start_date,
      end_date,
      course_id,
      batch_id,
      status,
      questions,
    } = req.body;

    if (!title || !subject || !duration_minutes || total_marks === undefined || passing_marks === undefined) {
      return res.status(400).json({ error: 'Title, subject, duration, total marks, and passing marks are required' });
    }

    const insertTest = db.prepare(`
      INSERT INTO tests (
        title, subject, description, duration_minutes, total_marks, passing_marks,
        start_date, end_date, course_id, batch_id, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQuestion = db.prepare(`
      INSERT INTO questions (
        test_id, question_text, question_type, option_a, option_b, option_c, option_d,
        correct_answer, marks, explanation, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertTest.run(
        title.trim(),
        subject.trim(),
        description || '',
        Number(duration_minutes),
        Number(total_marks),
        Number(passing_marks),
        start_date || null,
        end_date || null,
        course_id || null,
        batch_id || null,
        req.user!.id,
        status || 'published'
      );

      const testId = Number(result.lastInsertRowid);

      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((q: any, idx: number) => {
          insertQuestion.run(
            testId,
            q.question_text.trim(),
            q.question_type || 'mcq',
            q.option_a || null,
            q.option_b || null,
            q.option_c || null,
            q.option_d || null,
            q.correct_answer.trim(),
            Number(q.marks || 1),
            q.explanation || null,
            idx
          );
        });
      }

      return testId;
    });

    const testId = transaction();

    return res.status(201).json({
      message: 'Test created successfully',
      test_id: testId,
    });
  } catch (error: any) {
    console.error('Error in createTest:', error);
    return res.status(500).json({ error: 'Failed to create test' });
  }
};

export const updateTest = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subject,
      description,
      duration_minutes,
      total_marks,
      passing_marks,
      start_date,
      end_date,
      course_id,
      batch_id,
      status,
      questions,
    } = req.body;

    const existingTest = db.prepare('SELECT id FROM tests WHERE id = ?').get(id);
    if (!existingTest) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE tests
        SET title = COALESCE(?, title),
            subject = COALESCE(?, subject),
            description = COALESCE(?, description),
            duration_minutes = COALESCE(?, duration_minutes),
            total_marks = COALESCE(?, total_marks),
            passing_marks = COALESCE(?, passing_marks),
            start_date = COALESCE(?, start_date),
            end_date = COALESCE(?, end_date),
            course_id = COALESCE(?, course_id),
            batch_id = COALESCE(?, batch_id),
            status = COALESCE(?, status)
        WHERE id = ?
      `).run(
        title,
        subject,
        description,
        duration_minutes ? Number(duration_minutes) : undefined,
        total_marks !== undefined ? Number(total_marks) : undefined,
        passing_marks !== undefined ? Number(passing_marks) : undefined,
        start_date,
        end_date,
        course_id,
        batch_id,
        status,
        id
      );

      // If questions array provided, replace questions
      if (Array.isArray(questions)) {
        db.prepare('DELETE FROM questions WHERE test_id = ?').run(id);
        const insertQuestion = db.prepare(`
          INSERT INTO questions (
            test_id, question_text, question_type, option_a, option_b, option_c, option_d,
            correct_answer, marks, explanation, order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        questions.forEach((q: any, idx: number) => {
          insertQuestion.run(
            id,
            q.question_text.trim(),
            q.question_type || 'mcq',
            q.option_a || null,
            q.option_b || null,
            q.option_c || null,
            q.option_d || null,
            q.correct_answer.trim(),
            Number(q.marks || 1),
            q.explanation || null,
            idx
          );
        });
      }
    });

    transaction();
    return res.json({ message: 'Test updated successfully' });
  } catch (error: any) {
    console.error('Error in updateTest:', error);
    return res.status(500).json({ error: 'Failed to update test' });
  }
};

export const deleteTest = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tests WHERE id = ?').run(id);
    return res.json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteTest:', error);
    return res.status(500).json({ error: 'Failed to delete test' });
  }
};

export const duplicateTest = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(id) as any;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const questions = db.prepare('SELECT * FROM questions WHERE test_id = ?').all(id) as any[];

    const insertTest = db.prepare(`
      INSERT INTO tests (
        title, subject, description, duration_minutes, total_marks, passing_marks,
        start_date, end_date, course_id, batch_id, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `);

    const insertQuestion = db.prepare(`
      INSERT INTO questions (
        test_id, question_text, question_type, option_a, option_b, option_c, option_d,
        correct_answer, marks, explanation, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const result = insertTest.run(
        `${test.title} (Copy)`,
        test.subject,
        test.description,
        test.duration_minutes,
        test.total_marks,
        test.passing_marks,
        test.start_date,
        test.end_date,
        test.course_id,
        test.batch_id,
        req.user!.id
      );

      const newTestId = Number(result.lastInsertRowid);
      questions.forEach((q, idx) => {
        insertQuestion.run(
          newTestId,
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
      return newTestId;
    });

    const newTestId = transaction();
    return res.status(201).json({ message: 'Test duplicated successfully', new_test_id: newTestId });
  } catch (error: any) {
    console.error('Error in duplicateTest:', error);
    return res.status(500).json({ error: 'Failed to duplicate test' });
  }
};

export const toggleTestStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid test status' });
    }

    db.prepare('UPDATE tests SET status = ? WHERE id = ?').run(status, id);
    return res.json({ message: `Test status updated to ${status}` });
  } catch (error: any) {
    console.error('Error in toggleTestStatus:', error);
    return res.status(500).json({ error: 'Failed to update test status' });
  }
};

export const toggleTestMarksVisibility = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT id, marks_released FROM tests WHERE id = ?').get(id) as any;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const nextStatus = test.marks_released === 1 ? 0 : 1;
    db.prepare('UPDATE tests SET marks_released = ? WHERE id = ?').run(nextStatus, id);
    return res.json({
      message: `Marks visibility updated successfully. Status: ${nextStatus === 1 ? 'Released' : 'Hidden'}`,
      marks_released: nextStatus,
    });
  } catch (error: any) {
    console.error('Error in toggleTestMarksVisibility:', error);
    return res.status(500).json({ error: 'Failed to update marks visibility status' });
  }
};

// ============================================
// STUDENT TEST-TAKING & SUBMISSION ENGINE
// ============================================

export const getTestForStudent = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can take tests' });
    }

    const student = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const test = db.prepare(`
      SELECT 
        t.id, t.title, t.subject, t.description, t.duration_minutes, t.total_marks, t.passing_marks,
        c.title as course_title, b.name as batch_name
      FROM tests t
      LEFT JOIN courses c ON t.course_id = c.id
      LEFT JOIN batches b ON t.batch_id = b.id
      WHERE t.id = ? AND t.status = 'published'
    `).get(id) as any;

    if (!test) {
      return res.status(404).json({ error: 'Test not available or unpublished' });
    }

    // Check if student already submitted this test
    const existingAttempt = db.prepare(`
      SELECT * FROM test_attempts WHERE test_id = ? AND student_id = ?
    `).get(test.id, student.id) as any;

    if (existingAttempt && existingAttempt.status === 'submitted') {
      return res.status(400).json({
        error: 'You have already submitted this test.',
        already_submitted: true,
        attempt_id: existingAttempt.id,
      });
    }

    // Fetch questions WITHOUT exposing correct_answer or explanation
    const questions = db.prepare(`
      SELECT id, question_text, question_type, option_a, option_b, option_c, option_d, marks, order_index
      FROM questions
      WHERE test_id = ?
      ORDER BY order_index ASC, id ASC
    `).all(test.id);

    // If an attempt doesn't exist, create an in_progress attempt
    let attemptId = existingAttempt ? existingAttempt.id : null;
    if (!existingAttempt) {
      const insertAttempt = db.prepare(`
        INSERT INTO test_attempts (test_id, student_id, total_marks, status, start_time)
        VALUES (?, ?, ?, 'in_progress', CURRENT_TIMESTAMP)
      `).run(test.id, student.id, test.total_marks);
      attemptId = Number(insertAttempt.lastInsertRowid);
    }

    return res.json({
      test,
      questions,
      attempt_id: attemptId,
      start_time: existingAttempt ? existingAttempt.start_time : new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in getTestForStudent:', error);
    return res.status(500).json({ error: 'Failed to load test interface' });
  }
};

export const submitTestAttempt = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // test_id
    const { answers } = req.body; // Array of { question_id, selected_answer }

    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit tests' });
    }

    const student = db.prepare('SELECT id, full_name, user_id FROM students WHERE user_id = ?').get(req.user.id) as any;
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(id) as any;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Fetch all actual questions with correct answers
    const questions = db.prepare('SELECT * FROM questions WHERE test_id = ?').all(test.id) as any[];

    // Calculate score
    let calculatedScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const answerMap = new Map<number, string>();
    if (Array.isArray(answers)) {
      answers.forEach((ans: any) => {
        if (ans.question_id && ans.selected_answer) {
          answerMap.set(Number(ans.question_id), String(ans.selected_answer).trim());
        }
      });
    }

    const evaluatedBreakdown = questions.map((q) => {
      const selected = answerMap.get(q.id) || null;
      let isCorrect = false;
      let marksAwarded = 0;

      if (!selected) {
        unansweredCount++;
      } else {
        // Compare case-insensitively trimmed
        const isMatch = String(selected).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
        if (isMatch) {
          isCorrect = true;
          marksAwarded = Number(q.marks);
          calculatedScore += marksAwarded;
          correctCount++;
        } else {
          wrongCount++;
        }
      }

      return {
        question_id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        selected_answer: selected,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        max_marks: q.marks,
        explanation: q.explanation,
      };
    });

    const percentage = test.total_marks > 0 
      ? Math.round((calculatedScore / test.total_marks) * 100 * 10) / 10 
      : 0;
    const passed = calculatedScore >= test.passing_marks ? 1 : 0;

    // Update or Insert test attempt
    const updateAttempt = db.prepare(`
      INSERT INTO test_attempts (test_id, student_id, score, total_marks, percentage, passed, status, submitted_at, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP, ?)
      ON CONFLICT(test_id, student_id) DO UPDATE SET
        score = excluded.score,
        total_marks = excluded.total_marks,
        percentage = excluded.percentage,
        passed = excluded.passed,
        status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP,
        answers_json = excluded.answers_json
    `);

    updateAttempt.run(
      test.id,
      student.id,
      calculatedScore,
      test.total_marks,
      percentage,
      passed,
      JSON.stringify(evaluatedBreakdown)
    );

    const savedAttempt = db.prepare(
      'SELECT id FROM test_attempts WHERE test_id = ? AND student_id = ?'
    ).get(test.id, student.id) as any;

    // Send notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, 'test_result', ?)
    `).run(
      student.user_id,
      `Test Results: ${test.title}`,
      `You scored ${calculatedScore}/${test.total_marks} (${percentage}%). Status: ${passed ? 'PASSED 🎉' : 'NEEDS IMPROVEMENT'}.`,
      `/student/results/${savedAttempt?.id || ''}`
    );

    return res.json({
      message: 'Test submitted and graded successfully',
      attempt_id: savedAttempt?.id,
      result: {
        score: calculatedScore,
        total_marks: test.total_marks,
        passing_marks: test.passing_marks,
        percentage,
        passed: Boolean(passed),
        total_questions: questions.length,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered_questions: unansweredCount,
        breakdown: evaluatedBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Error in submitTestAttempt:', error);
    return res.status(500).json({ error: 'Failed to submit test' });
  }
};

export const getAttemptResult = (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = db.prepare(`
      SELECT 
        ta.*,
        t.title as test_title,
        t.subject,
        t.passing_marks,
        t.duration_minutes,
        t.marks_released,
        s.student_id,
        s.full_name as student_name,
        s.college_name,
        s.department
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      JOIN students s ON ta.student_id = s.id
      WHERE ta.id = ?
    `).get(attemptId) as any;

    if (!attempt) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    // Role security check: student can only view their own result
    if (req.user && req.user.role === 'student' && req.user.student_id !== attempt.student_id) {
      return res.status(403).json({ error: 'Access denied to this result' });
    }

    if (req.user && req.user.role === 'student' && !attempt.marks_released) {
      return res.json({
        attempt: {
          id: attempt.id,
          test_id: attempt.test_id,
          test_title: attempt.test_title,
          subject: attempt.subject,
          duration_minutes: attempt.duration_minutes,
          student_id: attempt.student_id,
          student_name: attempt.student_name,
          college_name: attempt.college_name,
          department: attempt.department,
          status: attempt.status,
          submitted_at: attempt.submitted_at,
          marks_released: 0,
          score: null,
          total_marks: attempt.total_marks,
          percentage: null,
          passed: null,
          breakdown: []
        }
      });
    }

    const breakdown = attempt.answers_json ? JSON.parse(attempt.answers_json) : [];

    return res.json({
      attempt: {
        ...attempt,
        breakdown,
      },
    });
  } catch (error: any) {
    console.error('Error in getAttemptResult:', error);
    return res.status(500).json({ error: 'Failed to retrieve test result' });
  }
};

export const getTestSubmissions = (req: Request, res: Response) => {
  try {
    const { id } = req.params; // test_id

    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(id) as any;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const submissions = db.prepare(`
      SELECT 
        ta.*,
        s.student_id,
        s.full_name as student_name,
        s.email as student_email,
        s.college_name,
        s.department,
        b.name as batch_name
      FROM test_attempts ta
      JOIN students s ON ta.student_id = s.id
      LEFT JOIN batch_students bs ON s.id = bs.student_id
      LEFT JOIN batches b ON bs.batch_id = b.id
      WHERE ta.test_id = ? AND ta.status = 'submitted'
      ORDER BY ta.score DESC, ta.submitted_at ASC
    `).all(test.id);

    // Calculate aggregated metrics
    const totalSubmissions = submissions.length;
    let avgScore = 0;
    let avgPercentage = 0;
    let highestScore = 0;
    let lowestScore = 0;
    let passedCount = 0;

    if (totalSubmissions > 0) {
      let sumScore = 0;
      let sumPercent = 0;
      highestScore = (submissions[0] as any).score;
      lowestScore = (submissions[0] as any).score;

      submissions.forEach((sub: any) => {
        sumScore += sub.score;
        sumPercent += sub.percentage;
        if (sub.score > highestScore) highestScore = sub.score;
        if (sub.score < lowestScore) lowestScore = sub.score;
        if (sub.passed) passedCount++;
      });

      avgScore = Math.round((sumScore / totalSubmissions) * 10) / 10;
      avgPercentage = Math.round((sumPercent / totalSubmissions) * 10) / 10;
    }

    return res.json({
      test,
      submissions,
      metrics: {
        total_submissions: totalSubmissions,
        avg_score: avgScore,
        avg_percentage: avgPercentage,
        highest_score: highestScore,
        lowest_score: lowestScore,
        passed_count: passedCount,
        failed_count: totalSubmissions - passedCount,
        pass_rate: totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('Error in getTestSubmissions:', error);
    return res.status(500).json({ error: 'Failed to retrieve test submissions' });
  }
};

export const exportTestResultsCSV = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const test = db.prepare('SELECT title, subject, total_marks, passing_marks FROM tests WHERE id = ?').get(id) as any;
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const submissions = db.prepare(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.college_name,
        s.department,
        ta.score,
        ta.total_marks,
        ta.percentage,
        ta.passed,
        ta.submitted_at
      FROM test_attempts ta
      JOIN students s ON ta.student_id = s.id
      WHERE ta.test_id = ? AND ta.status = 'submitted'
      ORDER BY ta.score DESC
    `).all(id) as any[];

    const headers = ['Student ID', 'Full Name', 'Email', 'College', 'Department', 'Score', 'Total Marks', 'Percentage', 'Status', 'Submitted At'];
    const rows = submissions.map(sub => [
      `"${sub.student_id}"`,
      `"${sub.full_name.replace(/"/g, '""')}"`,
      `"${sub.email}"`,
      `"${sub.college_name.replace(/"/g, '""')}"`,
      `"${sub.department}"`,
      sub.score,
      sub.total_marks,
      `${sub.percentage}%`,
      sub.passed ? 'PASSED' : 'FAILED',
      `"${sub.submitted_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results_${test.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
    return res.send(csvContent);
  } catch (error: any) {
    console.error('Error in exportTestResultsCSV:', error);
    return res.status(500).json({ error: 'Failed to export test results' });
  }
};
