import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BaseController } from '../../../base/controllers/BaseController';
import { UserService } from '../services/UserService';
import { User } from '../entities/User';
import { CreateUserDto, UpdateUserDto } from '../dto';

export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  private userService: UserService;

  constructor() {
    const userService = new UserService();
    super(userService);
    this.userService = userService;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const createUserDto = plainToInstance(CreateUserDto, req.body);
      const errors = await validate(createUserDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      const user = await this.userService.create(createUserDto);
      res.status(201).json(user.toResponse());
    } catch (error) {
      console.error('Error creating user:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      // Build pagination filters from query parameters using service
      const queryDto = this.userService.buildPaginationFilters(req.query);

      // Validate the query DTO
      const errors = await validate(queryDto);
      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      // Get paginated results
      const result = await this.userService.findAllPaginated(queryDto);

      // Transform user data to response format
      res.json({
        data: result.data.map((user) => user.toResponse()),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user.toResponse());
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateUserDto = plainToInstance(UpdateUserDto, req.body);
      const errors = await validate(updateUserDto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', '),
        );
        res.status(400).json({ error: errorMessages });
        return;
      }

      const user = await this.userService.update(id, updateUserDto);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user.toResponse());
    } catch (error) {
      console.error('Error updating user:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ error: message });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user.toResponse());
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
