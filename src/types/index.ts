/**
 * User Types
 */
export enum UserType {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  telegram_id?: string;
  username: string;
  password: string;
  user_type?: UserType;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  telegram_username?: string;
  telegram_chat_id?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Teacher {
  id: string;
  user_id: string;
  bank_account?: string;
  account_holder?: string;
  payment_method?: PaymentMethod;
  total_students: number;
  total_earnings: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Student {
  id: string;
  user_id: string;
  total_courses_enrolled: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Course Types
 */
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum PricingType {
  LIFETIME = 'LIFETIME',
  MONTHLY = 'MONTHLY',
  CATEGORY_BUNDLE = 'CATEGORY_BUNDLE',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_desc?: string;
  image?: string;
  teacher_id: string;
  category_id: string;
  pricing_type: PricingType;
  price: number;
  monthly_price?: number;
  total_duration: number;
  video_count: number;
  total_views: number;
  status: CourseStatus;
  is_published: boolean;
  created_at: Date;
  published_at?: Date;
  updated_at: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  course_id: string;
  video_id: string;
  is_free: boolean;
  duration?: number;
  test_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: string;
  youtube_video_id: string;
  youtube_url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  uploaded_at?: Date;
  fetched_at: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Enrollment & Progress Types
 */
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  purchase_price: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  access_start_date: Date;
  access_end_date?: Date;
  status: EnrollmentStatus;
  is_paid: boolean;
  paid_at?: Date;
  is_completed: boolean;
  completed_at?: Date;
  completion_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface Progress {
  id: string;
  student_id: string;
  enrollment_id: string;
  lesson_id: string;
  watched_percentage: number;
  watched_duration: number;
  total_duration: number;
  is_completed: boolean;
  is_started: boolean;
  started_at?: Date;
  last_watched_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Payment & Earning Types
 */
export enum PaymentMethod {
  CLICK = 'CLICK',
  PAYME = 'PAYME',
  UZCARD = 'UZCARD',
  MANUAL = 'MANUAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  external_id?: string;
  check_image_url?: string;
  receipt?: string;
  created_at: Date;
  updated_at: Date;
}

export enum EarningStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface Earning {
  id: string;
  teacher_id: string;
  enrollment_id: string;
  course_id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: EarningStatus;
  paid_at?: Date;
  payment_id?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Test & Review Types
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  lesson_id?: string;
  teacher_id: string;
  course_id: string;
  total_questions: number;
  passing_score?: number;
  duration?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  test_id: string;
  order: number;
  title: string;
  question_type: QuestionType;
  correct_answer?: string;
  score: number;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order: number;
  created_at: Date;
}

export interface TestResult {
  id: string;
  student_id: string;
  test_id: string;
  enrollment_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  started_at: Date;
  completed_at?: Date;
  duration?: number;
  answers: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Review {
  id: string;
  student_id: string;
  course_id: string;
  teacher_id: string;
  rating: number;
  title: string;
  content: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Pomodoro & Notes Types
 */
export interface PomodoroSession {
  id: string;
  student_id: string;
  course_id?: string;
  title: string;
  duration: number;
  started_at: Date;
  ended_at?: Date;
  paused_at?: Date;
  is_completed: boolean;
  actual_duration?: number;
  breaks: number;
  created_at: Date;
  updated_at: Date;
}

export interface PomodoroStatistic {
  id: string;
  student_id: string;
  today_duration: number;
  today_sessions: number;
  current_month_duration: number;
  current_month_sessions: number;
  total_duration: number;
  total_sessions: number;
  updated_at: Date;
}

export interface Note {
  id: string;
  student_id: string;
  course_id?: string;
  lesson_id?: string;
  title: string;
  content: string;
  tags: string[];
  is_public: boolean;
  is_favorite: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Notification Types
 */
export enum NotificationType {
  PAYMENT_LINK = 'PAYMENT_LINK',
  ENROLLMENT_SUCCESS = 'ENROLLMENT_SUCCESS',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  TEST_RESULT = 'TEST_RESULT',
  CERTIFICATE = 'CERTIFICATE',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: Date;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}


/**
 * Kafka Event Types
 */
export interface KafkaEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  id: string;
}

export interface PaymentInitiatedEvent {
  paymentId: string;
  studentId: string;
  courseId: string;
  amount: number;
  method: PaymentMethod;
  timestamp: Date;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  studentId: string;
  courseId: string;
  amount: number;
  timestamp: Date;
}

export interface EnrollmentCreatedEvent {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  timestamp: Date;
}

export interface NotificationSendEvent {
  type: NotificationType;
  studentId: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsEvent {
  type: string;
  studentId: string;
  courseId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

/**
 * Request/Response DTOs
 */
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  pricingType: PricingType;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  courseId: string;
  youtubeVideoId: string;
  order: number;
  isFree?: boolean;
}

// ========================================
// Authentication & Authorization Types
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: 'TEACHER' | 'STUDENT';
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  user_type: string;
  iat?: number;
  exp?: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// export interface JwtPayload {
//   sub: string;
//   userId: string;
//   userType: UserType;
//   iat: number;
//   exp: number;
// }