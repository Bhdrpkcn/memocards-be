import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { Deck } from '../entities/deck.entity';
import { Card } from '../entities/card.entity';
import { User } from 'src/entities/user.entity';
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
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
  ) {}

  async findAll(): Promise<DeckResponseDto[]> {
    const decks = await this.deckRepo.findAll({
      populate: ['fromLanguage', 'toLanguage'],
    });

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
      isCustom: deck.isCustom,
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
      isCustom: deck.isCustom,
      cardCount,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async findCustomDecksForUser(
    parentDeckId: number,
    userId: number,
  ): Promise<DeckResponseDto[]> {
    const parent = await this.deckRepo.findOne({ id: parentDeckId });
    if (!parent) {
      throw new NotFoundException(`Parent deck ${parentDeckId} not found`);
    }

    const decks = await this.deckRepo.find(
      {
        isCustom: true,
        parentDeck: parent,
        owner: userId,
      },
      { populate: ['fromLanguage', 'toLanguage', 'cards'] },
    );

    return decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      fromLanguageCode: deck.fromLanguage.code,
      toLanguageCode: deck.toLanguage.code,
      isPublic: deck.isPublic,
      isCustom: deck.isCustom,
      cardCount: deck.cards.length,
    }));
  }

  async createCustomDeckForUser(
    parentDeckId: number,
    userId: number,
    name: string,
  ): Promise<DeckDetailResponseDto> {
    const parent = await this.deckRepo.findOne(
      { id: parentDeckId },
      { populate: ['fromLanguage', 'toLanguage'] },
    );
    if (!parent) {
      throw new NotFoundException(`Parent deck ${parentDeckId} not found`);
    }

    const owner = await this.userRepo.findOne({ id: userId });
    if (!owner) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const deck = this.deckRepo.create({
      name,
      description: null,
      fromLanguage: parent.fromLanguage,
      toLanguage: parent.toLanguage,
      owner,
      isPublic: false,
      isCustom: true,
      parentDeck: parent,
    });

    await this.deckRepo.getEntityManager().persistAndFlush(deck);

    return {
      id: deck.id,
      name: deck.name,
      description: deck.description ?? undefined,
      fromLanguageCode: deck.fromLanguage.code,
      toLanguageCode: deck.toLanguage.code,
      isPublic: deck.isPublic,
      isCustom: deck.isCustom,
      cardCount: 0,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    };
  }

  async addCardToCustomDeck(
    customDeckId: number,
    userId: number,
    sourceCardId: number,
  ): Promise<void> {
    const deck = await this.deckRepo.findOne(
      { id: customDeckId },
      { populate: ['owner', 'cards'] },
    );
    if (!deck || !deck.isCustom) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    if (deck.owner && deck.owner.id !== userId) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    const source = await this.cardRepo.findOne(
      { id: sourceCardId },
      { populate: ['deck'] },
    );
    if (!source) {
      throw new NotFoundException(`Source card ${sourceCardId} not found`);
    }

    const existingCards = deck.cards.getItems();
    const maxOrderIndex =
      existingCards.length > 0
        ? Math.max(...existingCards.map((c) => c.orderIndex ?? 0))
        : 0;

    const nextOrderIndex = maxOrderIndex + 1;

    const copy = this.cardRepo.create({
      deck,
      frontText: source.frontText,
      backText: source.backText,
      extraInfo: (source as any).extraInfo ?? null,
      difficulty: source.difficulty,
      orderIndex: nextOrderIndex,
      createdBy: deck.owner,
    });

    await this.cardRepo.getEntityManager().persistAndFlush(copy);
  }

  async removeCardFromCustomDeck(
    customDeckId: number,
    userId: number,
    cardId: number,
  ): Promise<void> {
    const deck = await this.deckRepo.findOne(
      { id: customDeckId },
      { populate: ['owner'] },
    );
    if (!deck || !deck.isCustom) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    if (deck.owner && deck.owner.id !== userId) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    const card = await this.cardRepo.findOne({ id: cardId, deck });
    if (!card) {
      return;
    }

    await this.cardRepo.getEntityManager().removeAndFlush(card);
  }

  async deleteCustomDeck(customDeckId: number, userId: number): Promise<void> {
    const deck = await this.deckRepo.findOne(
      { id: customDeckId },
      { populate: ['owner', 'cards'] },
    );

    if (!deck || !deck.isCustom) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    if (deck.owner && deck.owner.id !== userId) {
      throw new NotFoundException(`Custom deck ${customDeckId} not found`);
    }

    const em = this.deckRepo.getEntityManager();

    for (const card of deck.cards) {
      em.remove(card);
    }

    em.remove(deck);
    await em.flush();
  }
}
