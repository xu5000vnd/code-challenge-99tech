import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../base/entities/BaseEntity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: 'password_hash' })
  password: string;

  @Column({ name: 'password_salt' })
  salt: string;

  toResponse() {
    const { password, salt, ...userWithoutSensitiveData } = this;
    return userWithoutSensitiveData;
  }
}
