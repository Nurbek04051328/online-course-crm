import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { User, LoginRequest, LoginResponse, RegisterRequest, JwtPayload, UserType } from '../types/index.js';

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiration: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'who is your daddy?';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '3600';
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<Omit<User, 'password'>> {
    // 1. Validate input
    if (!data.email || !data.password || !data.username) {
      throw new Error('Email, password, and username are required');
    }

    // 2. Check if user exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // 3. Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // 4. Create user
    const newUser = await this.userRepository.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      user_type: data.user_type as UserType,
      is_verified: false,
      is_active: true,
    });

    // 5. Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Check password
    const passwordMatch = await bcryptjs.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // 3. Check if user is active
    if (!user.is_active) {
      throw new Error('User account is disabled');
    }

    // 4. Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // 5. Update last login
    await this.userRepository.updateLastLogin(user.id);

    // 6. Return response
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        avatar: user.avatar,
        is_verified: user.is_verified,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as JwtPayload;

      // Get fresh user data
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Update profile
   */
  async updateProfile(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      avatar?: string;
      bio?: string;
    }
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.update(userId, data);
    if (!user) {
      throw new Error('Failed to update profile');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // 1. Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Verify old password
    const passwordMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new Error('Old password is incorrect');
    }

    // 3. Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // 4. Update password
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  /**
   * Private method: Generate access token
   */
  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      user_type: user.user_type as UserType,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: parseInt(this.jwtExpiration),
    });
  }

  /**
   * Private method: Generate refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      user_type: user.user_type as UserType,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '7d',
    });
  }
}

export const authServiceInstance = new AuthService();
export default AuthService;