import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '../../../base/services/BaseService';
import { PaginatedResponse, PaginationHelper } from '../../../base/dto/PaginationDto';
import { User } from '../entities/User';
import { CreateUserDto, UpdateUserDto, UserFilterDto, UserQueryDto } from '../dto';
import { UserRepository } from '../repositories/UserRepository';

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  private userRepository: UserRepository;

  constructor() {
    const userRepository = new UserRepository();
    super(userRepository);
    this.userRepository = userRepository;
  }

  async create(userData: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate salt
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash password with salt
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await this.userRepository.create({
      email: userData.email,
      name: userData.name,
      password: passwordHash,
      salt: salt,
    });

    return user;
  }

  async findAll(filters: UserFilterDto = {}): Promise<{ data: User[]; total: number }> {
    const data = await this.userRepository.findWithFilters(filters);
    const total = await this.userRepository.countWithFilters(filters);

    return { data, total };
  }

  /**
   * Build pagination filters from query parameters
   * @param query - Raw query parameters from request
   * @returns UserQueryDto with validated pagination
   */
  buildPaginationFilters(query: any): UserQueryDto {
    return plainToInstance(UserQueryDto, {
      search: query.search ? query.search.trim() : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
    });
  }

  /**
   * Find all users with pagination
   * @param queryDto - Query parameters with pagination
   * @returns Paginated response with users
   */
  async findAllPaginated(queryDto: UserQueryDto): Promise<PaginatedResponse<User>> {
    const filters: UserFilterDto = {
      search: queryDto.search,
      limit: queryDto.limit,
      offset: queryDto.offset,
    };

    const data = await this.userRepository.findWithFilters(filters);
    const total = await this.userRepository.countWithFilters(filters);

    return PaginationHelper.buildResponse(data, total, queryDto.page || 1, queryDto.limit || 10);
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User | null> {
    // Check if email is being updated and if it's already taken
    if (updateData.email) {
      const existingUser = await this.userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email is already taken');
      }
    }

    return await this.userRepository.update(id, updateData);
  }
}
