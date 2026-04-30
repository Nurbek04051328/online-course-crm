import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

export interface AuthRequest extends Request {
  userId?: string;
  user?: JwtPayload;
}

/**
 * Middleware: Verify JWT token
 * Usage: app.use(authMiddleware) or router.use(authMiddleware)
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized - No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    // Attach user info to request
    req.userId = payload.sub;
    req.user = payload;

    next();
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({
      error: 'Unauthorized - Invalid token',
    });
  }
};

/**
 * Middleware: Check user type
 * Usage: router.post('/route', checkRole('TEACHER'), handler)
 */
export const checkRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.user_type !== requiredRole) {
      res.status(403).json({
        error: `Forbidden - Only ${requiredRole}s can access this resource`,
      });
      return;
    }
    next();
  };
};