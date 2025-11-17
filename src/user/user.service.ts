import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ id });
  }

  async findOrCreateByEmail(email: string, name?: string): Promise<User> {
    let user = await this.userRepo.findOne({ email });

    if (!user) {
      user = this.userRepo.create({ email, name });

      await this.em.persistAndFlush(user);
    }

    return user;
  }
}
