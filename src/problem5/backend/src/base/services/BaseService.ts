import { IBaseService } from './IBaseService';
import { IBaseRepository } from '../repositories/IBaseRepository';
import { BaseEntity } from '../entities/BaseEntity';
import { DeepPartial } from 'typeorm';

export abstract class BaseService<T extends BaseEntity, CreateDTO, UpdateDTO>
  implements IBaseService<T, CreateDTO, UpdateDTO>
{
  constructor(protected repository: IBaseRepository<T>) {}

  async create(data: CreateDTO): Promise<T> {
    return await this.repository.create(data as DeepPartial<T>);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findById(id);
  }

  async findAll(filters?: any): Promise<{ data: T[]; total: number }> {
    const data = await this.repository.findAll(filters);
    const total = await this.repository.count();
    return { data, total };
  }

  async update(id: string, data: UpdateDTO): Promise<T | null> {
    return await this.repository.update(id, data as Partial<T>);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }
}
