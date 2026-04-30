// src/routes/lesson.routes.ts

import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const lessonController = new LessonController();

router.get('/:lessonId', (req, res, next) => lessonController.getLesson(req, res, next));

router.get('/course/:courseId', (req, res, next) =>
  lessonController.getCourseLessons(req, res, next)
);

router.get('/course/:courseId/preview', (req, res, next) =>
  lessonController.getFreeLessons(req, res, next)
);

router.post('/', authMiddleware, (req, res, next) =>
  lessonController.createLesson(req, res, next)
);

router.put('/:lessonId', authMiddleware, (req, res, next) =>
  lessonController.updateLesson(req, res, next)
);

router.delete('/:lessonId', authMiddleware, (req, res, next) =>
  lessonController.deleteLesson(req, res, next)
);

router.get('/:lessonId/next', (req, res, next) =>
  lessonController.getNextLesson(req, res, next)
);

router.get('/:lessonId/prev', (req, res, next) =>
  lessonController.getPreviousLesson(req, res, next)
);

export default router;