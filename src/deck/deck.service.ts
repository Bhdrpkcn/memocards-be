import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { Deck } from '../entities/deck.entity';
import { Card } from '../entities/card.entity';
import {
  DeckDetailResponseDto,
  DeckResponseDto,
} from './dto/deck-response.dto';

@Injectable()
export class DeckService {
  constructor(
    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,
    @InjectRepository(Card)
    private readonly cardRepo: EntityRepository<Card>,
  ) {}

  async findAll(): Promise<DeckResponseDto[]> {
    const decks = await this.deckRepo.findAll({
      populate: ['fromLanguage', 'toLanguage'],
    });

    // count cards per deck in parallel
    const counts = await Promise.all(
      decks.map((deck) => this.cardRepo.count({ deck })),
    );

    return decks.map((deck, index) => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      fromLanguageCode: deck.fromLanguage.code,
      toLanguageCode: deck.toLanguage.code,
      isPublic: deck.isPublic,
      cardCount: counts[index],
    }));
  }

  async findById(id: number): Promise<DeckDetailResponseDto> {
    const deck = await this.deckRepo.findOne(
      { id },
      { populate: ['fromLanguage', 'toLanguage'] },
    );

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const cardCount = await this.cardRepo.count({ deck });

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      fromLanguageCode: deck.fromLanguage.code,
      toLanguageCode: deck.toLanguage.code,
      isPublic: deck.isPublic,
      cardCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }
}
