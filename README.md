# 🎓 Online Course Platform

Multi-role E-Learning Platform na TypeScript bilan.

## 🚀 Features

- 👨‍🏫 **Teacher Dashboard** - Kurslarni boshqarish, analytics, earning
- 👨‍🎓 **Student Portal** - Kurslarni sotib olish, o'rganish, progress tracking
- 📚 **Course Management** - YouTube integratsiya, lessons, tests
- 💳 **Payments** - Click, Payme, Manual (Carta + Cek)
- 🔔 **Notifications** - Email, Telegram, In-app
- ⏱️ **Pomodoro Timer** - Study sessions tracking
- 📝 **Notes** - Student notes & flashcards
- 🤖 **Telegram Bot** - Bot commands va Web App
- 🔴 **Kafka** - Asynchronous event processing
- 🔵 **Redis** - Caching va real-time stats
- 🐳 **Docker** - Complete containerization

## 📋 Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- PostgreSQL 14+
- Redis 7+
- Kafka 3+
- Docker & Docker Compose

## 🔧 Installation

```bash
# 1. Clone repo
git clone <repo>
cd online-course-platform

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Start services
docker-compose -f docker-compose.dev.yml up -d

# 5. Initialize database
npm run db:migrate

# 6. Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── db/              # Database layer
├── repositories/    # Data access layer
├── services/        # Business logic
├── controllers/     # Request handlers
├── routes/          # API routes
├── kafka/           # Kafka producers/consumers
├── cache/           # Redis caching
├── auth/            # Authentication
├── telegram/        # Telegram bot
├── utils/           # Utilities
├── types/           # TypeScript types
├── middlewares/     # Express middlewares
├── config/          # Configuration
└── index.ts         # Main entry point
```

## 🛣️ API Routes

```
GET    /api/health                          Health check
POST   /api/auth/register                   Register
POST   /api/auth/login                      Login
POST   /api/auth/refresh                    Refresh token

GET    /api/courses                         Get all courses
POST   /api/courses                         Create course (teacher)
GET    /api/courses/:courseId               Get course details
PUT    /api/courses/:courseId               Update course
POST   /api/courses/:courseId/publish       Publish course

GET    /api/enrollments                     Get my enrollments
POST   /api/enrollments                     Enroll course
GET    /api/enrollments/:enrollmentId       Get enrollment

GET    /api/progress                        Get my progress
PUT    /api/progress/:lessonId              Update progress

GET    /api/payments                        Payment history
POST   /api/payments/initiate               Initiate payment
POST   /api/payments/webhook/click          Click webhook
POST   /api/payments/webhook/payme          Payme webhook

GET    /api/reviews                         Get reviews
POST   /api/reviews                         Create review

GET    /api/pomodoro                        Pomodoro stats
POST   /api/pomodoro/start                  Start session
POST   /api/pomodoro/complete               Complete session

GET    /api/notes                           Get notes
POST   /api/notes                           Create note
```

## 🔒 Authentication

JWT token based authentication bilan.

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "STUDENT"
  }
}
```

## 🔴 Kafka Topics

- `payment.initiated` - To'lov boshlandi
- `payment.completed` - To'lov tugatildi
- `notification.send` - Bildirishnoma yo'natish
- `enrollment.created` - Kurs sotilishi
- `analytics.event` - Analytics events

## 🔵 Redis Keys

- `user:{userId}:profile` - User profile cache
- `course:{courseId}:details` - Course details cache
- `progress:{studentId}:{lessonId}` - Progress cache
- `session:{userId}:{token}` - Session tokens

## 🐳 Docker Commands

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f api

# Stop all
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📊 Database Schema

Tables:
- `users` - User accounts
- `teachers` - Teacher profiles
- `students` - Student profiles
- `courses` - Course details
- `lessons` - Course lessons
- `enrollments` - Course enrollments
- `progress` - Student progress
- `payments` - Payment records
- `earnings` - Teacher earnings
- `reviews` - Course reviews
- `tests` - Quiz/tests
- `pomodoro_sessions` - Pomodoro sessions
- `notes` - Student notes

## 🚀 Deployment

Production deployment:

```bash
# Build
npm run build

# Start
npm start
```

See `docker-compose.prod.yml` for production setup.

## 📝 Environment Variables

```
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_course_db

REDIS_HOST=localhost
REDIS_PORT=6379

KAFKA_BROKERS=localhost:9092

JWT_SECRET=your_secret_key
JWT_EXPIRATION=3600

TELEGRAM_BOT_TOKEN=your_bot_token
YOUTUBE_API_KEY=your_youtube_key

CLICK_MERCHANT_ID=merchant_id
PAYME_MERCHANT_ID=merchant_id

NODE_ENV=development
API_PORT=3000
```

## 🧪 Testing

```bash
npm run test
npm run test:coverage
```

## 📚 Documentation

- [Database Schema](./docs/database.md)
- [API Documentation](./docs/api.md)
- [Architecture](./docs/architecture.md)
- [Kafka Events](./docs/kafka.md)

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Author

Created with ❤️ for education

## 📞 Support

Issues? Questions? Open an issue on GitHub.