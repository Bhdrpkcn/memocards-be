import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { Card } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { CardResponseDto } from './dto/card-response.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,
    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,
  ) {}

  async findByDeck(deckId: number): Promise<CardResponseDto[]> {
    const deck = await this.deckRepo.findOne({ id: deckId });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const cards = await this.cardRepo.find(
      { deck },
      {
        orderBy: { orderIndex: 'asc', id: 'asc' },
      },
    );

    return cards.map((card) => ({
      id: card.id,
      frontText: card.frontText,
      backText: card.backText,
      difficulty: card.difficulty ?? undefined,
      orderIndex: card.orderIndex,
    }));
  }
}
