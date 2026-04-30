// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest, RegisterRequest } from '../types/index.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      // Validate required fields
      if (!data.email || !data.password || !data.username || !data.first_name || !data.last_name) {
        res.status(400).json({
          error: 'Missing required fields: email, password, username, first_name, last_name',
        });
        return;
      }

      // Validate user_type
      if (!data.user_type || !['TEACHER', 'STUDENT'].includes(data.user_type)) {
        res.status(400).json({
          error: 'user_type must be TEACHER or STUDENT',
        });
        return;
      }

      // Register user
      const user = await this.authService.register(data);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      console.error('❌ Register error:', error.message);
      res.status(400).json({
        error: error.message || 'Registration failed',
      });
    }
  }

  /**
   * POST /api/auth/login
   * User login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginRequest = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(400).json({
          error: 'Email and password are required',
        });
        return;
      }

      // Login user
      const response = await this.authService.login(data);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: response,
      });
    } catch (error: any) {
      console.error('❌ Login error:', error.message);
      res.status(401).json({
        error: error.message || 'Login failed',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Refresh token is required',
        });
        return;
      }

      const response = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: response,
      });
    } catch (error: any) {
      console.error('❌ Refresh token error:', error.message);
      res.status(401).json({
        error: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized - User ID not found',
        });
        return;
      }

      const user = await this.authService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      console.error('❌ Get profile error:', error.message);
      res.status(404).json({
        error: error.message || 'Profile not found',
      });
    }
  }

  /**
   * PUT /api/auth/profile
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).userId;
      const data = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized - User ID not found',
        });
        return;
      }

      const updatedUser = await this.authService.updateProfile(userId, data);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error: any) {
      console.error('❌ Update profile error:', error.message);
      res.status(400).json({
        error: error.message || 'Profile update failed',
      });
    }
  }

  /**
   * POST /api/auth/change-password
   * Change user password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized - User ID not found',
        });
        return;
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          error: 'Old password and new password are required',
        });
        return;
      }

      await this.authService.changePassword(userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      console.error('❌ Change password error:', error.message);
      res.status(400).json({
        error: error.message || 'Password change failed',
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (frontend clears tokens)
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Logout failed',
      });
    }
  }
}

export const authControllerInstance = new AuthController();
export default AuthController;