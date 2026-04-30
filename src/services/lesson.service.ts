import { LessonRepository } from '../repositories/lesson.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';

export class LessonService {
  private lessonRepository: LessonRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
    this.courseRepository = new CourseRepository();
  }

  async createLesson(data: {
    title: string;
    description?: string;
    course_id: string;
    video_id: string;
    order: number;
    is_free?: boolean;
  }, teacherId: string): Promise<any> {
    const course = await this.courseRepository.findById(data.course_id);
    if (!course || course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - Course not found');
    }

    const lesson = await this.lessonRepository.create({
      title: data.title,
      description: data.description,
      course_id: data.course_id,
      video_id: data.video_id,
      order: data.order,
      is_free: data.is_free || false,
    });

    return lesson;
  }

  async getLessonDetails(lessonId: string): Promise<any> {
    const lesson = await this.lessonRepository.findWithDetails(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    return lesson;
  }

  async getCourseLessons(courseId: string): Promise<any[]> {
    return this.lessonRepository.findByCourse(courseId);
  }

  async getFreeLessons(courseId: string): Promise<any[]> {
    return this.lessonRepository.getFreeLessons(courseId);
  }

  async updateLesson(
    lessonId: string,
    teacherId: string,
    data: any
  ): Promise<any> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const course = await this.courseRepository.findById(lesson.course_id);
    if (!course || course.teacher_id !== teacherId) {
      throw new Error('Unauthorized');
    }

    const updated = await this.lessonRepository.update(lessonId, data);
    if (!updated) {
      throw new Error('Failed to update lesson');
    }

    return updated;
  }

  async deleteLesson(lessonId: string, teacherId: string): Promise<void> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const course = await this.courseRepository.findById(lesson.course_id);
    if (!course || course.teacher_id !== teacherId) {
      throw new Error('Unauthorized');
    }

    await this.lessonRepository.delete(lessonId);
  }

  async getNextLesson(courseId: string, currentLessonOrder: number): Promise<any> {
    return this.lessonRepository.getNextLesson(courseId, currentLessonOrder);
  }

  async getPreviousLesson(courseId: string, currentLessonOrder: number): Promise<any> {
    return this.lessonRepository.getPreviousLesson(courseId, currentLessonOrder);
  }
}

export const lessonServiceInstance = new LessonService();
export default LessonService;