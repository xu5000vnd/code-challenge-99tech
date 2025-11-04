import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../modules/user/entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    type: 'access',
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_ACCESS_EXPIRES_IN 
  } as jwt.SignOptions);
};

export const generateRefreshToken = (): string => {
  // Generate a secure random token
  return crypto.randomBytes(64).toString('hex');
};

export const generateTokenPair = (user: User): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(),
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const getRefreshTokenExpiryDate = (): Date => {
  const expiresIn = JWT_REFRESH_EXPIRES_IN;
  const now = new Date();
  
  // Parse the expiry string (e.g., '7d', '24h', '60m')
  const match = expiresIn.match(/^(\d+)([dhm])$/);
  if (!match) {
    // Default to 7 days if format is invalid
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
};

// Legacy function for backward compatibility
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;