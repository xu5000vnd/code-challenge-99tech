import { FindOptionsWhere, FindManyOptions, DeepPartial } from 'typeorm';

export interface IBaseRepository<T> {
  create(data: DeepPartial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(where: FindOptionsWhere<T>): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(where?: FindOptionsWhere<T>): Promise<number>;
}
