import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';
import { IBaseRepository } from './IBaseRepository';
import { BaseEntity } from '../entities/BaseEntity';

export abstract class BaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return await this.repository.findOne({ where });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.count({ where });
  }
}
