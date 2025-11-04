import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../services/AuthService';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const registerDto = plainToInstance(RegisterDto, req.body);
      const errors = await validate(registerDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = (req.ip || req.socket.remoteAddress) as string;

      const result = await this.authService.register(registerDto, deviceInfo, ipAddress);

      res.status(201).json(result);
    } catch (error) {
      console.error('Error registering user:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginDto = plainToInstance(LoginDto, req.body);
      const errors = await validate(loginDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = (req.ip || req.socket.remoteAddress) as string;

      const result = await this.authService.login(loginDto, deviceInfo, ipAddress);

      res.json(result);
    } catch (error) {
      console.error('Error logging in:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshTokenDto = plainToInstance(RefreshTokenDto, req.body);
      const errors = await validate(refreshTokenDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      const deviceInfo = req.headers['user-agent'];
      const ipAddress = (req.ip || req.socket.remoteAddress) as string;

      const result = await this.authService.refreshToken(refreshTokenDto, deviceInfo, ipAddress);

      res.json(result);
    } catch (error) {
      console.error('Error refreshing token:', error);
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({ error: message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      await this.authService.logout(refreshToken);

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(400).json({ error: message });
    }
  }

  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const sessions = await this.authService.getUserActiveSessions(userId);

      res.json({
        sessions: sessions.map((session) => ({
          id: session.id,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        })),
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      res.status(500).json({ error: 'Failed to get active sessions' });
    }
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.authService.logoutAll(userId);
      res.json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
      console.error('Error logging out from all devices:', error);
      res.status(400).json({ error: 'Failed to log out from all devices' });
    }
  }
}
