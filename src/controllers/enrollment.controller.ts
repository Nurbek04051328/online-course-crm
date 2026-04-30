import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  /**
   * POST /api/enrollments
   * Enroll student in course
   */
  async enrollCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId, purchasePrice } = req.body;

      if (!courseId || purchasePrice === undefined) {
        res.status(400).json({
          error: 'Missing required fields: courseId, purchasePrice',
        });
        return;
      }

      const enrollment = await this.enrollmentService.enrollStudent(studentId, courseId, purchasePrice);

      res.status(201).json({
        success: true,
        message: 'Enrolled successfully',
        data: enrollment,
      });
    } catch (error: any) {
      console.error('❌ Enrollment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/enrollments
   * Get student's enrollments
   */
  async getEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const enrollments = await this.enrollmentService.getStudentEnrollments(studentId, limit, offset);

      res.status(200).json({
        success: true,
        data: enrollments,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get enrollments error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/enrollments/:enrollmentId
   * Get enrollment details
   */
  async getEnrollment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await this.enrollmentService.getEnrollmentDetails(enrollmentId);

      res.status(200).json({
        success: true,
        data: enrollment,
      });
    } catch (error: any) {
      console.error('❌ Get enrollment error:', error.message);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/enrollments/:enrollmentId
   * Cancel enrollment
   */
  async cancelEnrollment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { enrollmentId } = req.params;

      await this.enrollmentService.cancelEnrollment(enrollmentId, studentId);

      res.status(200).json({
        success: true,
        message: 'Enrollment cancelled',
      });
    } catch (error: any) {
      console.error('❌ Cancel enrollment error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/courses/:courseId/enrollments
   * Get course enrollments (teacher only)
   */
  async getCourseEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const enrollments = await this.enrollmentService.getCourseEnrollments(courseId, teacherId, limit, offset);

      res.status(200).json({
        success: true,
        data: enrollments,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get course enrollments error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/enrollments/check-access/:courseId
   * Check if student has access to course
   */
  async checkAccess(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { courseId } = req.params;

      const hasAccess = await this.enrollmentService.checkAccess(studentId, courseId);

      res.status(200).json({
        success: true,
        hasAccess,
      });
    } catch (error: any) {
      console.error('❌ Check access error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
}

export const enrollmentControllerInstance = new EnrollmentController();
export default EnrollmentController;