import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { Card } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import { CardStatusKind } from '../entities/card-progress.entity';
import { CardResponseDto } from './dto/card-response.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,
    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,
  ) {}

  private mapStatusParam(status?: string): CardStatusKind | undefined {
    if (!status) return undefined;
    const normalized = status.toLowerCase();

    switch (normalized) {
      case 'known':
        return CardStatusKind.KNOWN;
      case 'review':
        return CardStatusKind.REVIEW;
      case 'unknown':
        return CardStatusKind.UNKNOWN;
      default:
        return undefined;
    }
  }

  async findByDeck(
    deckId: number,
    userId?: number,
    status?: string,
  ): Promise<CardResponseDto[]> {
    const deck = await this.deckRepo.findOne({ id: deckId });

    if (!deck) {
      throw new NotFoundException(`Deck ${deckId} not found`);
    }

    const statusEnum = this.mapStatusParam(status);

    let where: any = { deck };

    // .all → no userId or invalid status → return all cards
    if (userId && statusEnum) {
      where = {
        deck,
        progresses: {
          user: userId,
          statusKind: statusEnum,
        },
      };
    }

    const cards = await this.cardRepo.find(where, {
      orderBy: { orderIndex: 'asc', id: 'asc' },
    });

    return cards.map((card) => ({
      id: card.id,
      frontText: card.frontText,
      backText: card.backText,
      difficulty: card.difficulty ?? undefined,
      orderIndex: card.orderIndex,
    }));
  }
}
