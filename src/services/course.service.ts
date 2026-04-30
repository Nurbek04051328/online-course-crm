import { CourseRepository } from '../repositories/course.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { Course, CourseStatus, PricingType } from '../types/index.js';

export class CourseService {
  private courseRepository: CourseRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Create new course
   */
  async createCourse(data: {
    title: string;
    description: string;
    short_desc?: string;
    image?: string;
    teacher_id: string;
    category_id: string;
    price: number;
    pricing_type: 'LIFETIME' | 'MONTHLY' | 'CATEGORY_BUNDLE';
    monthly_price?: number;
  }): Promise<Course> {
    // 1. Validate
    if (!data.title || !data.description || !data.teacher_id || !data.category_id) {
      throw new Error('Missing required fields: title, description, teacher_id, category_id');
    }

    // 2. Check category exists
    const category = await this.categoryRepository.findById(data.category_id);
    if (!category) {
      throw new Error('Category not found');
    }

    // 3. Generate slug
    const slug = this.generateSlug(data.title);

    // 4. Check slug uniqueness
    const slugExists = await this.courseRepository.slugExists(slug);
    if (slugExists) {
      throw new Error('Course with this title already exists');
    }

    // 5. Create course
    const newCourse = await this.courseRepository.create({
      title: data.title,
      slug,
      description: data.description,
      short_desc: data.short_desc,
      image: data.image,
      teacher_id: data.teacher_id,
      category_id: data.category_id,
      price: data.price,
      pricing_type: data.pricing_type as PricingType,
      monthly_price: data.monthly_price,
      status: CourseStatus.DRAFT,
      is_published: false,
    });

    return newCourse;
  }

  /**
   * Get course details
   */
  async getCourseDetails(courseId: string): Promise<any> {
    const course = await this.courseRepository.findWithDetails(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  /**
   * Get courses by teacher
   */
  async getTeacherCourses(
    teacherId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Course[]> {
    return this.courseRepository.findByTeacher(teacherId, limit, offset);
  }

  /**
   * Get courses by category
   */
  async getCategoryCourses(
    categoryId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Course[]> {
    return this.courseRepository.findByCategory(categoryId, limit, offset);
  }

  /**
   * Search courses
   */
  async searchCourses(
    query: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Course[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    return this.courseRepository.search(query, limit, offset);
  }

  /**
   * Get trending courses
   */
  async getTrendingCourses(limit: number = 10): Promise<Course[]> {
    return this.courseRepository.getTrending(limit);
  }

  /**
   * Get all published courses
   */
  async getPublishedCourses(limit: number = 10, offset: number = 0): Promise<Course[]> {
    return this.courseRepository.getPublished(limit, offset);
  }

  /**
   * Update course
   */
  async updateCourse(
    courseId: string,
    teacherId: string,
    data: {
      title?: string;
      description?: string;
      short_desc?: string;
      image?: string;
      price?: number;
      monthly_price?: number;
      category_id?: string;
    }
  ): Promise<Course> {
    // 1. Get course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check ownership
    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    // 3. Update
    const updatedCourse = await this.courseRepository.update(courseId, data);
    if (!updatedCourse) {
      throw new Error('Failed to update course');
    }

    return updatedCourse;
  }

  /**
   * Publish course
   */
  async publishCourse(courseId: string, teacherId: string): Promise<Course> {
    // 1. Get course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check ownership
    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    // 3. Check if has lessons
    const lessonCount = await this.getLessonCount(courseId);
    if (lessonCount === 0) {
      throw new Error('Cannot publish course without lessons');
    }

    // 4. Publish
    const publishedCourse = await this.courseRepository.updateStatus(courseId, 'PUBLISHED');
    if (!publishedCourse) {
      throw new Error('Failed to publish course');
    }

    return publishedCourse;
  }

  /**
   * Archive course
   */
  async archiveCourse(courseId: string, teacherId: string): Promise<Course> {
    // 1. Get course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check ownership
    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    // 3. Archive
    const archivedCourse = await this.courseRepository.updateStatus(courseId, 'ARCHIVED');
    if (!archivedCourse) {
      throw new Error('Failed to archive course');
    }

    return archivedCourse;
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string, teacherId: string): Promise<void> {
    // 1. Get course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check ownership
    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    // 3. Check if has active enrollments
    const enrollmentCount = await this.getActiveEnrollmentCount(courseId);
    if (enrollmentCount > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }

    // 4. Delete
    await this.courseRepository.delete(courseId);
  }

  /**
   * Get course revenue
   */
  async getCourseRevenue(courseId: string, teacherId: string): Promise<any> {
    // 1. Get course
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // 2. Check ownership
    if (course.teacher_id !== teacherId) {
      throw new Error('Unauthorized - You do not own this course');
    }

    // 3. Get revenue
    return this.courseRepository.getCourseRevenue(courseId);
  }

  /**
   * Get category
   */
  async getCategory(categoryId: string): Promise<any> {
    const category = await this.categoryRepository.findWithStats(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<any[]> {
    return this.categoryRepository.getActive();
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Generate slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Get lesson count for course
   */
  private async getLessonCount(courseId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM public.lessons
      WHERE course_id = $1
    `;
    const result = await (this.courseRepository as any).client.query(query, [courseId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get active enrollment count
   */
  private async getActiveEnrollmentCount(courseId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM public.enrollments
      WHERE course_id = $1 AND status = 'ACTIVE'
    `;
    const result = await (this.courseRepository as any).client.query(query, [courseId]);
    return parseInt(result.rows[0].count, 10);
  }
}

export const courseServiceInstance = new CourseService();
export default CourseService;