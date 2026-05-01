import { ReviewRepository } from '../repositories/review.repository.js';
import { EnrollmentRepository } from '../repositories/enrollment.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { Review } from '../types/index.js';
 
export class ReviewService {
  private reviewRepository: ReviewRepository;
  private enrollmentRepository: EnrollmentRepository;
  private courseRepository: CourseRepository;
 
  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.enrollmentRepository = new EnrollmentRepository();
    this.courseRepository = new CourseRepository();
  }
 
  /**
   * Create review
   */
  async createReview(data: {
    studentId: string;
    courseId: string;
    rating: number;
    title: string;
    content: string;
  }): Promise<Review> {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
 
    // Check if enrolled
    const enrollment = await this.enrollmentRepository.findActiveEnrollment(
      data.studentId,
      data.courseId
    );
    if (!enrollment) {
      throw new Error('You must be enrolled in this course to leave a review');
    }
 
    // Check if already reviewed
    const hasReviewed = await this.reviewRepository.hasReviewed(data.studentId, data.courseId);
    if (hasReviewed) {
      throw new Error('You have already reviewed this course');
    }
 
    // Get course to get teacher ID
    const course = await this.courseRepository.findById(data.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
 
    // Create review
    const review = await this.reviewRepository.create({
      student_id: data.studentId,
      course_id: data.courseId,
      teacher_id: course.teacher_id,
      rating: data.rating,
      title: data.title,
      content: data.content,
      is_verified: true, // Auto-verified since student is enrolled
    });
 
    return review;
  }
 
  /**
   * Get course reviews
   */
  async getCourseReviews(
    courseId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    return this.reviewRepository.findByCourse(courseId, limit, offset);
  }
 
  /**
   * Get teacher reviews
   */
  async getTeacherReviews(
    teacherId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    return this.reviewRepository.findByTeacher(teacherId, limit, offset);
  }
 
  /**
   * Get course rating stats
   */
  async getCourseRating(courseId: string): Promise<any> {
    return this.reviewRepository.getCourseRatingStats(courseId);
  }
 
  /**
   * Get teacher rating stats
   */
  async getTeacherRating(teacherId: string): Promise<any> {
    return this.reviewRepository.getTeacherRatingStats(teacherId);
  }
 
  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    studentId: string,
    data: {
      rating?: number;
      title?: string;
      content?: string;
    }
  ): Promise<Review> {
    // Get review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
 
    // Verify ownership
    if (review.student_id !== studentId) {
      throw new Error('Unauthorized - Cannot edit other reviews');
    }
 
    // Validate rating if provided
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
 
    // Update
    const updated = await this.reviewRepository.update(reviewId, data);
    if (!updated) {
      throw new Error('Failed to update review');
    }
 
    return updated;
  }
 
  /**
   * Delete review
   */
  async deleteReview(reviewId: string, studentId: string): Promise<void> {
    // Get review
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
 
    // Verify ownership
    if (review.student_id !== studentId) {
      throw new Error('Unauthorized - Cannot delete other reviews');
    }
 
    // Delete
    await this.reviewRepository.delete(reviewId);
  }
 
  /**
   * Mark as helpful
   */
  async markHelpful(reviewId: string): Promise<Review> {
    const updated = await this.reviewRepository.incrementHelpful(reviewId);
    if (!updated) {
      throw new Error('Review not found');
    }
    return updated;
  }
 
  /**
   * Get student's review for course
   */
  async getStudentReview(studentId: string, courseId: string): Promise<Review | null> {
    return this.reviewRepository.findStudentReview(studentId, courseId);
  }
 
  /**
   * Get most helpful reviews
   */
  async getMostHelpfulReviews(courseId: string, limit: number = 5): Promise<Review[]> {
    return this.reviewRepository.getMostHelpful(courseId, limit);
  }
}
 
export const reviewServiceInstance = new ReviewService();
export default ReviewService;