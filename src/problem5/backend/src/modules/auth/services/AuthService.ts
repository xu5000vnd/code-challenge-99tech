import bcrypt from 'bcryptjs';
import { UserRepository } from '../../user/repositories/UserRepository';
import { AuthenticationRepository } from '../repositories/AuthenticationRepository';
import { User } from '../../user/entities/User';
import { Authentication } from '../entities/Authentication';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dto';
import {
  generateTokenPair,
  generateAccessToken,
  getRefreshTokenExpiryDate,
} from '../../../utils/jwt';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private authenticationRepository: AuthenticationRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.authenticationRepository = new AuthenticationRepository();
  }

  async register(
    registerData: RegisterDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(registerData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate salt
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash password with salt
    const passwordHash = await bcrypt.hash(registerData.password, salt);

    // Create user
    const user = await this.userRepository.create({
      email: registerData.email,
      name: registerData.name,
      password: passwordHash,
      salt: salt,
    });

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken, deviceInfo, ipAddress);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toResponse(),
    };
  }

  async login(loginData: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken, deviceInfo, ipAddress);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toResponse(),
    };
  }

  async refreshToken(
    refreshTokenData: RefreshTokenDto,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<RefreshResponse> {
    // Find refresh token
    const storedToken = await this.authenticationRepository.findValidByToken(
      refreshTokenData.refreshToken,
    );

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.isExpired()) {
      await this.authenticationRepository.revokeToken(refreshTokenData.refreshToken);
      throw new Error('Refresh token expired');
    }

    // Check if token is valid
    if (!storedToken.isValid()) {
      throw new Error('Refresh token is not valid');
    }

    // Get user
    const user = storedToken.user;
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = generateTokenPair(user);

    // Revoke old refresh token
    await this.authenticationRepository.revokeToken(refreshTokenData.refreshToken);

    // Store new refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken, deviceInfo, ipAddress);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    // Revoke the refresh token
    const revoked = await this.authenticationRepository.revokeToken(refreshToken);

    if (!revoked) {
      throw new Error('Invalid refresh token');
    }

    return true;
  }

  async getUserActiveSessions(userId: string): Promise<Authentication[]> {
    const tokens = await this.authenticationRepository.findByUserId(userId);
    return tokens.filter((token) => token.isValid());
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<Authentication> {
    const expiresAt = getRefreshTokenExpiryDate();

    return await this.authenticationRepository.create({
      token,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
      isRevoked: false,
    });
  }

  async cleanupExpiredTokens(): Promise<number> {
    return await this.authenticationRepository.deleteExpiredTokens();
  }

  async cleanupRevokedTokens(): Promise<number> {
    return await this.authenticationRepository.deleteRevokedTokens();
  }

  async logoutAll(userId: string): Promise<boolean> {
    return await this.authenticationRepository.revokeAllUserTokens(userId);
  }
}
