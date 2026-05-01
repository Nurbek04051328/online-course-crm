import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
 
export interface AuthRequest extends Request {
  userId?: string;
}
 
export class ReviewController {
  private reviewService: ReviewService;
 
  constructor() {
    this.reviewService = new ReviewService();
  }
 
  /**
   * POST /api/reviews
   * Create review
   */
  async createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
 
      const { courseId, rating, title, content } = req.body;
 
      if (!courseId || !rating || !title || !content) {
        res.status(400).json({
          error: 'Missing required fields: courseId, rating, title, content',
        });
        return;
      }
 
      const review = await this.reviewService.createReview({
        studentId,
        courseId,
        rating,
        title,
        content,
      });
 
      res.status(201).json({
        success: true,
        message: 'Review created',
        data: review,
      });
    } catch (error: any) {
      console.error('❌ Create review error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * GET /api/courses/:courseId/reviews
   * Get course reviews
   */
  async getCourseReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
 
      const reviews = await this.reviewService.getCourseReviews(courseId, limit, offset);
 
      res.status(200).json({
        success: true,
        data: reviews,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get course reviews error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * GET /api/courses/:courseId/rating
   * Get course rating stats
   */
  async getCourseRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
 
      const rating = await this.reviewService.getCourseRating(courseId);
 
      res.status(200).json({
        success: true,
        data: rating,
      });
    } catch (error: any) {
      console.error('❌ Get course rating error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * GET /api/teachers/:teacherId/reviews
   * Get teacher reviews
   */
  async getTeacherReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
 
      const reviews = await this.reviewService.getTeacherReviews(teacherId, limit, offset);
 
      res.status(200).json({
        success: true,
        data: reviews,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('❌ Get teacher reviews error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * GET /api/teachers/:teacherId/rating
   * Get teacher rating stats
   */
  async getTeacherRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.params;
 
      const rating = await this.reviewService.getTeacherRating(teacherId);
 
      res.status(200).json({
        success: true,
        data: rating,
      });
    } catch (error: any) {
      console.error('❌ Get teacher rating error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * PUT /api/reviews/:reviewId
   * Update review
   */
  async updateReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
 
      const { reviewId } = req.params;
      const data = req.body;
 
      const updated = await this.reviewService.updateReview(reviewId, studentId, data);
 
      res.status(200).json({
        success: true,
        message: 'Review updated',
        data: updated,
      });
    } catch (error: any) {
      console.error('❌ Update review error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * DELETE /api/reviews/:reviewId
   * Delete review
   */
  async deleteReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.userId;
      if (!studentId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
 
      const { reviewId } = req.params;
 
      await this.reviewService.deleteReview(reviewId, studentId);
 
      res.status(200).json({
        success: true,
        message: 'Review deleted',
      });
    } catch (error: any) {
      console.error('❌ Delete review error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * POST /api/reviews/:reviewId/helpful
   * Mark review as helpful
   */
  async markHelpful(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reviewId } = req.params;
 
      const updated = await this.reviewService.markHelpful(reviewId);
 
      res.status(200).json({
        success: true,
        message: 'Marked as helpful',
        data: updated,
      });
    } catch (error: any) {
      console.error('❌ Mark helpful error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
 
  /**
   * GET /api/courses/:courseId/reviews/helpful
   * Get most helpful reviews
   */
  async getMostHelpful(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
 
      const reviews = await this.reviewService.getMostHelpfulReviews(courseId, limit);
 
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      console.error('❌ Get helpful reviews error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
}
 
export const reviewControllerInstance = new ReviewController();
export default ReviewController;
 