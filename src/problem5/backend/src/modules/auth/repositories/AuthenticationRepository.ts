import { Repository, LessThan } from 'typeorm';
import { BaseRepository } from '../../../base/repositories/BaseRepository';
import { Authentication } from '../entities/Authentication';
import { AppDataSource } from '../../../config/database';

export class AuthenticationRepository extends BaseRepository<Authentication> {
  constructor() {
    const repository: Repository<Authentication> = AppDataSource.getRepository(Authentication);
    super(repository);
  }

  async findByToken(token: string): Promise<Authentication | null> {
    return await this.repository.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  async findValidByToken(token: string): Promise<Authentication | null> {
    return await this.repository.findOne({
      where: {
        token,
        isRevoked: false,
      },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<Authentication[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await this.repository.update(
      { token },
      { isRevoked: true }
    );
    return (result.affected ?? 0) > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<boolean> {
    const result = await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
    return (result.affected ?? 0) > 0;
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }

  async deleteRevokedTokens(): Promise<number> {
    const result = await this.repository.delete({
      isRevoked: true,
    });
    return result.affected ?? 0;
  }
}

