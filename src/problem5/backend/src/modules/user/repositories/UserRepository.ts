import { Repository, FindManyOptions, ILike, Or } from 'typeorm';
import { BaseRepository } from '../../../base/repositories/BaseRepository';
import { User } from '../entities/User';
import { AppDataSource } from '../../../config/database';
import { UserFilterDto } from '../dto';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    const repository: Repository<User> = AppDataSource.getRepository(User);
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findWithFilters(filters: UserFilterDto): Promise<User[]> {
    const options: FindManyOptions<User> = {
      order: { createdAt: 'DESC' },
    };

    // Use OR logic to search in both name and email fields
    if (filters.search) {
      // Trim whitespace and special characters from search term
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        options.where = [
          { name: ILike(`%${searchTerm}%`) },
          { email: ILike(`%${searchTerm}%`) },
        ];
      }
    }

    if (filters.limit) {
      options.take = filters.limit;
    }

    if (filters.offset) {
      options.skip = filters.offset;
    }

    return await this.repository.find(options);
  }

  async countWithFilters(filters: Omit<UserFilterDto, 'limit' | 'offset'>): Promise<number> {
    // Use OR logic to search in both name and email fields
    if (filters.search) {
      // Trim whitespace and special characters from search term
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        return await this.repository.count({
          where: [
            { name: ILike(`%${searchTerm}%`) },
            { email: ILike(`%${searchTerm}%`) },
          ],
        });
      }
    }

    return await this.repository.count();
  }
}
