import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  /**
   * POST /api/courses
   * Create new course (teacher only)
   */
  async createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = req.body;

      // Validate
      if (!data.title || !data.description || !data.category_id || data.price === undefined) {
        res.status(400).json({
          error: 'Missing required fields: title, description, category_id, price',
        });
        return;
      }

      // Create course
      const course = await this.courseService.createCourse({
        ...data,
        teacher_id: teacherId,
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error: any) {
      console.error('❌ Create course error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses/:courseId
   * Get course details
   */
  async getCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;

      const course = await this.courseService.getCourseDetails(courseId);

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      console.error('❌ Get course error:', error.message);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses
   * Get all published courses (with filters)
   */
  async getAllCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const categoryId = req.query.category as string;

      let courses;

      if (search) {
        // Search
        courses = await this.courseService.searchCourses(search, limit, offset);
      } else if (categoryId) {
        // By category
        courses = await this.courseService.getCategoryCourses(categoryId, limit, offset);
      } else {
        // All published
        courses = await this.courseService.getPublishedCourses(limit, offset);
      }

      res.status(200).json({
        success: true,
        data: courses,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get courses error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses/trending
   * Get trending courses
   */
  async getTrendingCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const courses = await this.courseService.getTrendingCourses(limit);

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error: any) {
      console.error('❌ Get trending courses error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses/my-courses
   * Get teacher's courses (teacher only)
   */
  async getTeacherCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const courses = await this.courseService.getTeacherCourses(teacherId, limit, offset);

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error: any) {
      console.error('❌ Get teacher courses error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * PUT /api/courses/:courseId
   * Update course (owner only)
   */
  async updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;
      const data = req.body;

      const updatedCourse = await this.courseService.updateCourse(courseId, teacherId, data);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse,
      });
    } catch (error: any) {
      console.error('❌ Update course error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/courses/:courseId/publish
   * Publish course (owner only)
   */
  async publishCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;

      const publishedCourse = await this.courseService.publishCourse(courseId, teacherId);

      res.status(200).json({
        success: true,
        message: 'Course published successfully',
        data: publishedCourse,
      });
    } catch (error: any) {
      console.error('❌ Publish course error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/courses/:courseId/archive
   * Archive course (owner only)
   */
  async archiveCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;

      const archivedCourse = await this.courseService.archiveCourse(courseId, teacherId);

      res.status(200).json({
        success: true,
        message: 'Course archived successfully',
        data: archivedCourse,
      });
    } catch (error: any) {
      console.error('❌ Archive course error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/courses/:courseId
   * Delete course (owner only)
   */
  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;

      await this.courseService.deleteCourse(courseId, teacherId);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error: any) {
      console.error('❌ Delete course error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses/:courseId/revenue
   * Get course revenue (owner only)
   */
  async getCourseRevenue(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;

      const revenue = await this.courseService.getCourseRevenue(courseId, teacherId);

      res.status(200).json({
        success: true,
        data: revenue,
      });
    } catch (error: any) {
      console.error('❌ Get revenue error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/categories
   * Get all categories
   */
  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.courseService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      console.error('❌ Get categories error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/categories/:categoryId
   * Get category details
   */
  async getCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId } = req.params;

      const category = await this.courseService.getCategory(categoryId);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.error('❌ Get category error:', error.message);
      res.status(404).json({ error: error.message });
    }
  }
}

export const courseControllerInstance = new CourseController();
export default CourseController;