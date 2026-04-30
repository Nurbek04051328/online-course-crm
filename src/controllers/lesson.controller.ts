// src/controllers/lesson.controller.ts

import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

  async createLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = req.body;

      if (!data.title || !data.course_id || !data.video_id) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const lesson = await this.lessonService.createLesson(data, teacherId);

      res.status(201).json({
        success: true,
        message: 'Lesson created',
        data: lesson,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;

      const lesson = await this.lessonService.getLessonDetails(lessonId);

      res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getCourseLessons(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;

      const lessons = await this.lessonService.getCourseLessons(courseId);

      res.status(200).json({
        success: true,
        data: lessons,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getFreeLessons(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;

      const lessons = await this.lessonService.getFreeLessons(courseId);

      res.status(200).json({
        success: true,
        data: lessons,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { lessonId } = req.params;
      const data = req.body;

      const updated = await this.lessonService.updateLesson(lessonId, teacherId, data);

      res.status(200).json({
        success: true,
        message: 'Lesson updated',
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.userId;
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { lessonId } = req.params;

      await this.lessonService.deleteLesson(lessonId, teacherId);

      res.status(200).json({
        success: true,
        message: 'Lesson deleted',
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getNextLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;
      const { courseId } = req.query;

      if (!courseId) {
        res.status(400).json({ error: 'Course ID required' });
        return;
      }

      const lesson = await this.lessonService.getLessonDetails(lessonId);
      const nextLesson = await this.lessonService.getNextLesson(courseId as string, lesson.order);

      res.status(200).json({
        success: true,
        data: nextLesson,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getPreviousLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;
      const { courseId } = req.query;

      if (!courseId) {
        res.status(400).json({ error: 'Course ID required' });
        return;
      }

      const lesson = await this.lessonService.getLessonDetails(lessonId);
      const prevLesson = await this.lessonService.getPreviousLesson(courseId as string, lesson.order);

      res.status(200).json({
        success: true,
        data: prevLesson,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const lessonControllerInstance = new LessonController();
export default LessonController;