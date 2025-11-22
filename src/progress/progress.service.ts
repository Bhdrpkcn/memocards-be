import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

import { CardProgress, CardStatusKind } from '../entities/card-progress.entity';

import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CardProgress)
    private readonly progressRepo: EntityRepository<CardProgress>,

    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly em: EntityManager,
  ) {}

  async setStatus(userId: number, cardId: number, status: CardStatusKind) {
    const user = await this.userRepo.findOneOrFail({ id: userId });
    const card = await this.cardRepo.findOneOrFail({ id: cardId });

    let progress = await this.progressRepo.findOne({ user, card });

    if (!progress) {
      progress = this.progressRepo.create({
        user,
        card,
        statusKind: status,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0,
      });
    } else {
      progress.statusKind = status;
      // update EF / interval / repetitions, etc. if you already do that
    }

    progress.lastReviewedAt = new Date();
    await this.em.persistAndFlush(progress);

    return progress;
  }
}
