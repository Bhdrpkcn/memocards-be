import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Card } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,
    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,
  ) {}

  async findByDeck(deckId: number): Promise<Card[]> {
    const deck = await this.deckRepo.findOne({ id: deckId });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    return this.cardRepo.find(
      { deck },
      {
        orderBy: { id: 'asc' },
      },
    );
  }
}
