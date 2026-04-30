import { EnrollmentRepository } from '../repositories/enrollment.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { Enrollment, EnrollmentStatus, PaymentMethod } from '../types/index.js';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
    this.courseRepository = new CourseRepository();
  }

  /**
   * Enroll student in course
   */
  async enrollStudent(studentId: string, courseId: string, purchasePrice: number): Promise<Enrollment> {
    // 1. Validate course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check if already enrolled
    const isEnrolled = await this.enrollmentRepository.isEnrolled(studentId, courseId);
    if (isEnrolled) {
      throw new Error('Student already enrolled in this course');
    }

    // 3. Create enrollment
    const enrollment = await this.enrollmentRepository.create({
      student_id: studentId,
      course_id: courseId,
      purchase_price: purchasePrice,
      payment_method: PaymentMethod.MANUAL, // Will be updated after payment
      access_start_date: new Date(),
      // access_end_date: null, // Lifetime
      status: EnrollmentStatus.ACTIVE,
      is_paid: false,
      completion_percentage: 0,
    });

    return enrollment;
  }

  /**
   * Mark enrollment as paid
   */
  async markAsPaid(enrollmentId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.update(enrollmentId, {
      is_paid: true,
      paid_at: new Date(),
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return enrollment;
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(studentId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    return this.enrollmentRepository.findByStudent(studentId, limit, offset);
  }

  /**
   * Get enrollment details
   */
  async getEnrollmentDetails(enrollmentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findWithDetails(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    return enrollment;
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(enrollmentId: string, studentId: string): Promise<Enrollment> {
    // 1. Get enrollment
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // 2. Check ownership
    if (enrollment.student_id !== studentId) {
      throw new Error('Unauthorized - Cannot cancel other student enrollment');
    }

    // 3. Update status
    const updated = await this.enrollmentRepository.update(enrollmentId, {
      status: EnrollmentStatus.CANCELLED,
    });

    if (!updated) {
      throw new Error('Failed to cancel enrollment');
    }

    return updated;
  }

  /**
   * Get course enrollments (for teacher)
   */
  async getCourseEnrollments(courseId: string, teacherId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    // Verify teacher owns course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    return this.enrollmentRepository.findByCourse(courseId, limit, offset);
  }

  /**
   * Check access (for lesson viewing)
   */
  async checkAccess(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findActiveEnrollment(studentId, courseId);
    
    if (!enrollment) {
      return false;
    }

    // Check if access expired
    if (enrollment.access_end_date && new Date(enrollment.access_end_date) < new Date()) {
      return false;
    }

    // Check if paid
    if (!enrollment.is_paid) {
      return false;
    }

    return true;
  }

  /**
   * Get student's active enrollment for course
   */
  async getActiveEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    return this.enrollmentRepository.findActiveEnrollment(studentId, courseId);
  }

  /**
   * Update completion percentage
   */
  async updateCompletion(enrollmentId: string, completionPercentage: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.update(enrollmentId, {
      completion_percentage: completionPercentage,
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // If 100%, mark as completed
    if (completionPercentage >= 100) {
      return this.enrollmentRepository.update(enrollmentId, {
        is_completed: true,
        completed_at: new Date(),
      }) as Promise<Enrollment>;
    }

    return enrollment;
  }
}

export const enrollmentServiceInstance = new EnrollmentService();
export default EnrollmentService;