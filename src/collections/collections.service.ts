import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

import { User } from '../entities/user.entity';
import { Word } from '../entities/word.entity';
import {
  CollectionScope,
  UserWordCollection,
} from '../entities/user-word-collection.entity';
import { UserWordCollectionItem } from '../entities/user-word-collection-item.entity';
import {
  CardProgress,
  CardStatusKind,
} from 'src/entities/card-progress.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    @InjectRepository(UserWordCollection)
    private readonly collectionRepo: EntityRepository<UserWordCollection>,

    @InjectRepository(UserWordCollectionItem)
    private readonly itemRepo: EntityRepository<UserWordCollectionItem>,

    @InjectRepository(Word)
    private readonly wordRepo: EntityRepository<Word>,

    @InjectRepository(CardProgress)
    private readonly progressRepo: EntityRepository<CardProgress>,

    private readonly em: EntityManager,
  ) {}

  async listCollections(userId: number, scope?: CollectionScope) {
    const where: Partial<UserWordCollection> = {
      user: { id: userId } as any,
    };

    if (scope) {
      where.scope = scope;
    }

    const collections = await this.collectionRepo.find(where, {
      populate: ['items'],
      orderBy: { createdAt: 'DESC' },
    });

    return collections.map((c) => ({
      id: c.id,
      name: c.name,
      scope: c.scope,
      languageCode: c.languageCode ?? null,
      createdAt: c.createdAt,
      wordCount: c.items.getItems().length,
    }));
  }

  async createCollection(params: {
    userId: number;
    name: string;
    scope: CollectionScope;
    languageCode?: string;
  }) {
    const { userId, name, scope, languageCode } = params;

    const user = await this.userRepo.findOneOrFail({ id: userId });

    if (scope === CollectionScope.LANGUAGE && !languageCode) {
      throw new Error('languageCode is required when scope=LANGUAGE');
    }

    const collection = this.collectionRepo.create({
      user,
      name,
      scope,
      languageCode: scope === CollectionScope.LANGUAGE ? languageCode : null,
    });

    await this.em.persistAndFlush(collection);

    return {
      id: collection.id,
      name: collection.name,
      scope: collection.scope,
      languageCode: collection.languageCode ?? null,
      wordCount: 0,
    };
  }

  async addWordToCollection(params: {
    userId: number;
    collectionId: number;
    wordId: number;
  }) {
    const { userId, collectionId, wordId } = params;

    const collection = await this.collectionRepo.findOne(
      { id: collectionId },
      { populate: ['user'] },
    );
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.user.id !== userId) {
      throw new ForbiddenException('Not owner of this collection');
    }

    const word = await this.wordRepo.findOneOrFail({ id: wordId });

    // avoid duplicates
    const existing = await this.itemRepo.findOne({
      collection,
      word,
    });
    if (existing) {
      return {
        id: existing.id,
        collectionId: collection.id,
        wordId: word.id,
      };
    }

    const item = this.itemRepo.create({
      collection,
      word,
    });

    await this.em.persistAndFlush(item);

    return {
      id: item.id,
      collectionId: collection.id,
      wordId: word.id,
    };
  }

  async getCollectionWords(params: {
    collectionId: number;
    fromLanguageCode: string;
    toLanguageCode: string;
  }) {
    const { collectionId, fromLanguageCode, toLanguageCode } = params;

    const collection = await this.collectionRepo.findOne(
      { id: collectionId },
      { populate: ['items.word.translations'] },
    );

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const words = collection.items.getItems().flatMap((item) => {
      const pair = this.extractWordPair(
        item.word,
        fromLanguageCode,
        toLanguageCode,
      );
      return pair ? [pair] : [];
    });

    return {
      collectionId: collection.id,
      name: collection.name,
      scope: collection.scope,
      languageCode: collection.languageCode ?? null,
      fromLanguage: fromLanguageCode,
      toLanguage: toLanguageCode,
      wordCount: words.length,
      words,
    };
  }

  async getCollectionWordsByProgress(params: {
    collectionId: number;
    userId: number;
    fromLanguageCode: string;
    toLanguageCode: string;
    status: CardStatusKind;
  }) {
    const { collectionId, userId, fromLanguageCode, toLanguageCode, status } =
      params;

    const collection = await this.collectionRepo.findOne(
      { id: collectionId },
      { populate: ['items.word.translations'] },
    );

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const items = collection.items.getItems();
    if (items.length === 0) {
      return this.emptyResponse(collection, fromLanguageCode, toLanguageCode);
    }

    const wordIds = items.map((i) => i.word.id);

    const progresses = await this.progressRepo.find({
      user: userId,
      word: { $in: wordIds },
      fromLanguageCode,
      toLanguageCode,
      statusKind: status,
    });

    const allowedWordIds = new Set(progresses.map((p) => p.word.id));

    const words = items.flatMap((item) => {
      if (!allowedWordIds.has(item.word.id)) return [];

      const pair = this.extractWordPair(
        item.word,
        fromLanguageCode,
        toLanguageCode,
      );
      return pair ? [pair] : [];
    });

    return {
      collectionId: collection.id,
      name: collection.name,
      scope: collection.scope,
      languageCode: collection.languageCode ?? null,
      fromLanguage: fromLanguageCode,
      toLanguage: toLanguageCode,
      wordCount: words.length,
      words,
    };
  }

  async deleteCollection(params: { userId: number; collectionId: number }) {
    const { userId, collectionId } = params;

    const collection = await this.collectionRepo.findOne(
      { id: collectionId },
      { populate: ['user', 'items'] },
    );
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.user.id !== userId) {
      throw new ForbiddenException('Not owner of this collection');
    }

    // remove items first, then collection
    for (const item of collection.items.getItems()) {
      await this.em.removeAndFlush(item);
    }

    await this.em.removeAndFlush(collection);

    return { success: true };
  }

  private extractWordPair(word: Word, from: string, to: string) {
    const translations = word.translations.getItems();
    const f = translations.find((t) => t.languageCode === from);
    const t = translations.find((t) => t.languageCode === to);
    if (!f || !t) return null;
    return { wordId: word.id, front: f.text, back: t.text };
  }

  private emptyResponse(c: UserWordCollection, from: string, to: string) {
    return {
      collectionId: c.id,
      name: c.name,
      scope: c.scope,
      languageCode: c.languageCode ?? null,
      fromLanguage: from,
      toLanguage: to,
      wordCount: 0,
      words: [],
    };
  }
}
