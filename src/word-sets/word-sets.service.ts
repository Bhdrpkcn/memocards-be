import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

import { WordSet } from '../entities/word-set.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';

@Injectable()
export class WordSetsService {
  constructor(
    @InjectRepository(WordSet)
    private readonly wordSetRepo: EntityRepository<WordSet>,
    @InjectRepository(Word)
    private readonly wordRepo: EntityRepository<Word>,
    @InjectRepository(WordTranslation)
    private readonly translationRepo: EntityRepository<WordTranslation>,
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
}
