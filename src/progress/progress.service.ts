import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

import { CardProgress, CardStatusKind } from '../entities/card-progress.entity';
import { Word } from '../entities/word.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CardProgress)
    private readonly progressRepo: EntityRepository<CardProgress>,

    @InjectRepository(Word)
    private readonly wordRepo: EntityRepository<Word>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    private readonly em: EntityManager,
  ) {}

  async setStatus(
    userId: number,
    wordId: number,
    fromLanguageCode: string,
    toLanguageCode: string,
    status: CardStatusKind,
  ) {
    const user = await this.userRepo.findOneOrFail({ id: userId });
    const word = await this.wordRepo.findOneOrFail({ id: wordId });

    let progress = await this.progressRepo.findOne({
      user,
      word,
      fromLanguageCode,
      toLanguageCode,
    });

    if (!progress) {
      progress = this.progressRepo.create({
        user,
        word,
        fromLanguageCode,
        toLanguageCode,
        statusKind: status,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0,
      });
    } else {
      progress.statusKind = status;
      // TODO: here you can later update EF / interval / repetitions if needed
    }

    progress.lastReviewedAt = new Date();
    await this.em.persistAndFlush(progress);

    return progress;
  }
}
