import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllCourses = (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT 
        c.*,
        st.full_name as trainer_name,
        st.designation as trainer_designation,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as enrolled_students_count,
        (SELECT COUNT(*) FROM batches b WHERE b.course_id = c.id) as batches_count
      FROM courses c
      LEFT JOIN staff st ON c.trainer_id = st.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (category) {
      query += ` AND c.category = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.id ASC`;

    const courses = db.prepare(query).all(...params) as any[];

    const parsedCourses = courses.map(c => ({
      ...c,
      skills_gained: typeof c.skills_gained === 'string' ? JSON.parse(c.skills_gained || '[]') : c.skills_gained,
      modules: typeof c.modules === 'string' ? JSON.parse(c.modules || '[]') : c.modules,
    }));

    return res.json({ courses: parsedCourses });
  } catch (error: any) {
    console.error('Error in getAllCourses:', error);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseBySlug = (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const course = db.prepare(`
      SELECT 
        c.*,
        st.full_name as trainer_name,
        st.designation as trainer_designation,
        st.email as trainer_email,
        (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.course_id = c.id) as enrolled_students_count
      FROM courses c
      LEFT JOIN staff st ON c.trainer_id = st.id
      WHERE c.slug = ? OR c.id = ?
    `).get(slug, slug) as any;

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get active batches for this course
    const batches = db.prepare(`
      SELECT b.*, st.full_name as trainer_name
      FROM batches b
      LEFT JOIN staff st ON b.trainer_id = st.id
      WHERE b.course_id = ?
    `).all(course.id);

    return res.json({
      course: {
        ...course,
        skills_gained: typeof course.skills_gained === 'string' ? JSON.parse(course.skills_gained || '[]') : course.skills_gained,
        modules: typeof course.modules === 'string' ? JSON.parse(course.modules || '[]') : course.modules,
      },
      batches,
    });
  } catch (error: any) {
    console.error('Error in getCourseBySlug:', error);
    return res.status(500).json({ error: 'Failed to retrieve course details' });
  }
};

export const createCourse = (req: Request, res: Response) => {
  try {
    const { title, slug, category, description, duration, skills_gained, modules, trainer_id, is_published, image_url } = req.body;

    if (!title || !description || !duration) {
      return res.status(400).json({ error: 'Title, description, and duration are required' });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const skillsJson = Array.isArray(skills_gained) ? JSON.stringify(skills_gained) : (skills_gained || '[]');
    const modulesJson = Array.isArray(modules) ? JSON.stringify(modules) : (modules || '[]');

    const result = db.prepare(`
      INSERT INTO courses (title, slug, category, description, duration, skills_gained, modules, trainer_id, is_published, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      generatedSlug,
      category || 'Core Technology',
      description,
      duration,
      skillsJson,
      modulesJson,
      trainer_id || null,
      is_published !== false ? 1 : 0,
      image_url || null
    );

    return res.status(201).json({
      message: 'Course created successfully',
      course_id: Number(result.lastInsertRowid),
    });
  } catch (error: any) {
    console.error('Error in createCourse:', error);
    return res.status(500).json({ error: 'Failed to create course' });
  }
};

export const updateCourse = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, category, description, duration, skills_gained, modules, trainer_id, is_published, image_url } = req.body;

    const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const skillsJson = skills_gained ? (Array.isArray(skills_gained) ? JSON.stringify(skills_gained) : skills_gained) : undefined;
    const modulesJson = modules ? (Array.isArray(modules) ? JSON.stringify(modules) : modules) : undefined;

    db.prepare(`
      UPDATE courses
      SET title = COALESCE(?, title),
          slug = COALESCE(?, slug),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          duration = COALESCE(?, duration),
          skills_gained = COALESCE(?, skills_gained),
          modules = COALESCE(?, modules),
          trainer_id = COALESCE(?, trainer_id),
          is_published = COALESCE(?, is_published),
          image_url = COALESCE(?, image_url)
      WHERE id = ?
    `).run(
      title,
      slug,
      category,
      description,
      duration,
      skillsJson,
      modulesJson,
      trainer_id,
      is_published !== undefined ? (is_published ? 1 : 0) : undefined,
      image_url,
      id
    );

    return res.json({ message: 'Course updated successfully' });
  } catch (error: any) {
    console.error('Error in updateCourse:', error);
    return res.status(500).json({ error: 'Failed to update course' });
  }
};

export const deleteCourse = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    return res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteCourse:', error);
    return res.status(500).json({ error: 'Failed to delete course' });
  }
};
