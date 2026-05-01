import { TestRepository } from '../repositories/test.repository.js';
import { QuestionRepository } from '../repositories/question.repository.js';
import { TestResultRepository } from '../repositories/test-result.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';

export class TestService {
  private testRepository: TestRepository;
  private questionRepository: QuestionRepository;
  private testResultRepository: TestResultRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.testRepository = new TestRepository();
    this.questionRepository = new QuestionRepository();
    this.testResultRepository = new TestResultRepository();
    this.courseRepository = new CourseRepository();
  }

  async createTest(data: {
    title: string;
    description?: string;
    course_id: string;
    lesson_id?: string;
    passing_score?: number;
    duration?: number;
  }, teacherId: string): Promise<any> {
    const course = await this.courseRepository.findById(data.course_id);
    if (!course || course.teacher_id !== teacherId) {
      throw new Error('Unauthorized');
    }

    const test = await this.testRepository.create({
      title: data.title,
      description: data.description,
      course_id: data.course_id,
      lesson_id: data.lesson_id,
      teacher_id: teacherId,
      passing_score: data.passing_score || 70,
      duration: data.duration,
      is_active: true,
    });

    return test;
  }

  async getTestDetails(testId: string): Promise<any> {
    const test = await this.testRepository.findWithQuestions(testId);
    if (!test) {
      throw new Error('Test not found');
    }
    return test;
  }

  async getCourseTests(courseId: string): Promise<any[]> {
    return this.testRepository.findByCourse(courseId);
  }

  async submitTestAnswers(
    studentId: string,
    testId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ): Promise<any> {
    // Get test with all questions
    const test = await this.testRepository.findWithQuestions(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Calculate score
    let totalScore = 0;
    let maxScore = 0;

    for (const question of test.questions) {
      maxScore += question.score;

      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        const option = question.options.find(o => o.id === answer.selectedOptionId);
        if (option?.is_correct) {
          totalScore += question.score;
        }
      }
    }

    const percentage = (totalScore / maxScore) * 100;
    const passed = percentage >= (test.passing_score || 70);

    // Save result
    const result = await this.testResultRepository.create({
      student_id: studentId,
      test_id: testId,
      score: totalScore,
      total_score: maxScore,
      percentage: Math.round(percentage),
      passed,
      completed_at: new Date(),
    });

    return result;
  }

  async getStudentResults(studentId: string): Promise<any> {
    return this.testResultRepository.findByStudent(studentId);
  }

  async getStudentStats(studentId: string): Promise<any> {
    return this.testResultRepository.getStudentTestStats(studentId);
  }
}

export const testServiceInstance = new TestService();
export default TestService;