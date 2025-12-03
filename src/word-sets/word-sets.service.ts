import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

import { WordSet } from '../entities/word-set.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import {
  CardProgress,
  CardStatusKind,
} from 'src/entities/card-progress.entity';

@Injectable()
export class WordSetsService {
  constructor(
    @InjectRepository(WordSet)
    private readonly wordSetRepo: EntityRepository<WordSet>,
    @InjectRepository(Word)
    private readonly wordRepo: EntityRepository<Word>,
    @InjectRepository(WordTranslation)
    private readonly translationRepo: EntityRepository<WordTranslation>,
    @InjectRepository(CardProgress)
    private readonly progressRepo: EntityRepository<CardProgress>,
  ) {}

  async listWordSets(params: {
    fromLanguageCode?: string;
    toLanguageCode?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) {
    const { fromLanguageCode, toLanguageCode, difficulty } = params;

    const where: Partial<Pick<WordSet, 'difficulty'>> = {};
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const sets = await this.wordSetRepo.find(where, {
      populate: ['words.translations'],
    });

    if (!fromLanguageCode || !toLanguageCode) {
      return sets.map((ws) => ({
        id: ws.id,
        name: ws.name,
        description: ws.description,
        difficulty: ws.difficulty,
      }));
    }

    const filtered = sets.filter((ws) =>
      ws.words.getItems().some((word) => {
        const langs = word.translations.getItems().map((t) => t.languageCode);
        return (
          langs.includes(fromLanguageCode) && langs.includes(toLanguageCode)
        );
      }),
    );

    return filtered.map((ws) => ({
      id: ws.id,
      name: ws.name,
      description: ws.description,
      difficulty: ws.difficulty,
    }));
  }

  async getWordsForSet(
    wordSetId: number,
    fromLanguageCode: string,
    toLanguageCode: string,
  ) {
    const wordSet = await this.wordSetRepo.findOne(
      { id: wordSetId },
      { populate: ['words.translations'] },
    );

    if (!wordSet) {
      throw new NotFoundException(`WordSet ${wordSetId} not found`);
    }

    const words = wordSet.words.getItems().flatMap((word) => {
      const translations = word.translations.getItems();

      const from = translations.find(
        (t) => t.languageCode === fromLanguageCode,
      );
      const to = translations.find((t) => t.languageCode === toLanguageCode);

      if (!from || !to) {
        return [];
      }

      return [
        {
          wordId: word.id,
          front: from.text,
          back: to.text,
        },
      ];
    });

    return {
      wordSetId: wordSet.id,
      name: wordSet.name,
      difficulty: wordSet.difficulty,
      fromLanguage: fromLanguageCode,
      toLanguage: toLanguageCode,
      words,
    };
  }

  async getWordsForSetByProgress(
    wordSetId: number,
    userId: number,
    fromLanguageCode: string,
    toLanguageCode: string,
    status: CardStatusKind,
  ) {
    const wordSet = await this.wordSetRepo.findOne(
      { id: wordSetId },
      { populate: ['words.translations'] },
    );

    if (!wordSet) {
      throw new NotFoundException(`WordSet ${wordSetId} not found`);
    }

    const words = wordSet.words.getItems();
    const wordIds = words.map((w) => w.id);

    if (wordIds.length === 0) {
      return {
        wordSetId: wordSet.id,
        name: wordSet.name,
        difficulty: wordSet.difficulty,
        fromLanguage: fromLanguageCode,
        toLanguage: toLanguageCode,
        words: [],
      };
    }

    const progresses = await this.progressRepo.find({
      user: userId,
      word: { $in: wordIds },
      fromLanguageCode,
      toLanguageCode,
      statusKind: status,
    });

    const progressedWordIds = new Set(progresses.map((p) => p.word.id));

    const filteredWords = words.flatMap((word) => {
      if (!progressedWordIds.has(word.id)) {
        return [];
      }

      const translations = word.translations.getItems();

      const from = translations.find(
        (t) => t.languageCode === fromLanguageCode,
      );
      const to = translations.find((t) => t.languageCode === toLanguageCode);

      if (!from || !to) {
        return [];
      }

      return [
        {
          wordId: word.id,
          front: from.text,
          back: to.text,
        },
      ];
    });

    return {
      wordSetId: wordSet.id,
      name: wordSet.name,
      difficulty: wordSet.difficulty,
      fromLanguage: fromLanguageCode,
      toLanguage: toLanguageCode,
      words: filteredWords,
    };
  }
}
