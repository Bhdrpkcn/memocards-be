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

  // Simple placeholder – Phase 3 will add SM-2 logic here
  async setStatus(
    userId: number,
    cardId: number,
    statusKind: CardStatusKind,
  ): Promise<CardProgress> {
    const user = await this.userRepo.findOneOrFail({ id: userId });
    const card = await this.cardRepo.findOneOrFail({ id: cardId });

    let progress = await this.progressRepo.findOne({ user, card });

    if (!progress) {
      progress = this.progressRepo.create({
        user,
        card,
      });
    }

    progress.statusKind = statusKind;
    progress.lastReviewedAt = new Date();

    await this.em.persistAndFlush(progress);
    return progress;
  }
}
