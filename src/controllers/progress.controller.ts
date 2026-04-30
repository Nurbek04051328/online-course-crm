import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../services/progress.service.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  async updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { lessonId } = req.params;
      const { watchedDuration, watchedPercentage } = req.body;

      if (watchedDuration === undefined || watchedPercentage === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const progress = await this.progressService.updateProgress(
        studentId,
        lessonId,
        watchedDuration,
        watchedPercentage
      );

      res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEnrollmentProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { enrollmentId } = req.params;
      const progress = await this.progressService.getEnrollmentProgress(enrollmentId, studentId);

      res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLessonProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { lessonId } = req.params;
      const progress = await this.progressService.getLessonProgress(studentId, lessonId);

      res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getIncompleteLessons(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { enrollmentId } = req.params;
      const lessons = await this.progressService.getIncompleteLessons(enrollmentId, studentId);

      res.status(200).json({ success: true, data: lessons });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async completeLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { lessonId } = req.params;
      const progress = await this.progressService.completeLessonManually(studentId, lessonId);

      res.status(200).json({ success: true, data: progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCourseStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const stats = await this.progressService.getCourseStats(courseId);

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getDailyStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await this.progressService.getDailyStats(studentId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStudyTime(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.status(200).json({ success: true, data: { studyTime: 0 } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const progressControllerInstance = new ProgressController();
export default ProgressController;