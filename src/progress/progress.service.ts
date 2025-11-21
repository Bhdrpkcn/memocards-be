import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

import { CardProgress, CardStatusKind } from '../entities/card-progress.entity';

import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';
import { Deck } from '../entities/deck.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CardProgress)
    private readonly progressRepo: EntityRepository<CardProgress>,

    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,

    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,

    private readonly em: EntityManager,
  ) {}

  async setStatus(
    userId: number,
    cardId: number,
    statusKind: CardStatusKind,
  ): Promise<CardProgress> {
    const user = await this.userRepo.findOneOrFail({ id: userId });

    const card = await this.cardRepo.findOneOrFail(
      { id: cardId },
      { populate: ['deck'] },
    );

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

    if (statusKind === CardStatusKind.CUSTOM) {
      await this.addToCustomDeck(user, card);
    }

    return progress;
  }

  private async addToCustomDeck(user: User, card: Card) {
    const deck = await this.deckRepo.findOneOrFail(
      { id: card.deck.id },
      { populate: ['fromLanguage', 'toLanguage'] },
    );

    if (!deck.fromLanguage || !deck.toLanguage) {
      throw new Error('Deck languages are not configured correctly');
    }

    const from = deck.fromLanguage;
    const to = deck.toLanguage;

    const deckName = `Custom ${from.code.toUpperCase()}→${to.code.toUpperCase()}`;

    let customDeck = await this.deckRepo.findOne({
      owner: user,
      name: deckName,
      fromLanguage: from,
      toLanguage: to,
    });

    if (!customDeck) {
      customDeck = this.deckRepo.create({
        name: deckName,
        owner: user,
        fromLanguage: from,
        toLanguage: to,
        isPublic: false,
      });
      await this.em.persistAndFlush(customDeck);
    }

    const exists = await this.em.findOne(Card, {
      deck: customDeck,
      frontText: card.frontText,
      backText: card.backText,
    });

    if (!exists) {
      const copy = this.cardRepo.create({
        deck: customDeck,
        frontText: card.frontText,
        backText: card.backText,
        difficulty: card.difficulty,
        orderIndex: Math.floor(Date.now() / 1000),
        createdBy: user,
      });

      await this.em.persistAndFlush(copy);
    }
  }
}
