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

  async findOrCreateByEmail(email: string, name?: string): Promise<User> {
    const em = this.em.fork();

    let user = await em.findOne(User, { email });

    if (!user) {
      user = em.create(User, { email, name });
      await em.persistAndFlush(user);
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const em = this.em.fork();
    return em.findOne(User, { id });
  }
}
