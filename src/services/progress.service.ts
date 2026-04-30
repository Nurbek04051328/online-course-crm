import { ProgressRepository } from '../repositories/progress.repository.js';
import { EnrollmentRepository } from '../repositories/enrollment.repository.js';
import { Progress } from '../types/index.js';

export class ProgressService {
  private progressRepository: ProgressRepository;
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.progressRepository = new ProgressRepository();
    this.enrollmentRepository = new EnrollmentRepository();
  }

  async updateProgress(
    studentId: string,
    lessonId: string,
    watchedDuration: number,
    watchedPercentage: number
  ): Promise<Progress> {
    let progress = await this.progressRepository.findByLessonStudent(lessonId, studentId);

    if (!progress) {
      throw new Error('Progress record not found');
    }

    const updated = await this.progressRepository.update(progress.id, {
      watched_duration: watchedDuration,
      watched_percentage: watchedPercentage,
      is_started: true,
      last_watched_at: new Date(),
      is_completed: watchedPercentage >= 100,
    });

    if (!updated) {
      throw new Error('Failed to update progress');
    }

    return updated;
  }

  async getEnrollmentProgress(enrollmentId: string, studentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment || enrollment.student_id !== studentId) {
      throw new Error('Unauthorized');
    }

    const progress = await this.progressRepository.findByEnrollment(enrollmentId);
    const stats = await this.progressRepository.getStudentCourseProgress(enrollmentId);

    return { stats, lessons: progress };
  }

  async getLessonProgress(studentId: string, lessonId: string): Promise<Progress | null> {
    return this.progressRepository.findByLessonStudent(lessonId, studentId);
  }

  async getIncompleteLessons(enrollmentId: string, studentId: string): Promise<Progress[]> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment || enrollment.student_id !== studentId) {
      throw new Error('Unauthorized');
    }

    return this.progressRepository.getIncompleteLessons(enrollmentId);
  }

  async completeLessonManually(studentId: string, lessonId: string): Promise<Progress> {
    const progress = await this.progressRepository.findByLessonStudent(lessonId, studentId);

    if (!progress) {
      throw new Error('Progress record not found');
    }

    const updated = await this.progressRepository.update(progress.id, {
      is_completed: true,
      watched_percentage: 100,
    });

    if (!updated) {
      throw new Error('Failed to complete lesson');
    }

    return updated;
  }

  async getCourseStats(courseId: string): Promise<any> {
    return this.progressRepository.getCourseStats(courseId);
  }

  async getDailyStats(studentId: string): Promise<any> {
    return this.progressRepository.getDailyStats(studentId);
  }
}

export const progressServiceInstance = new ProgressService();
export default ProgressService;