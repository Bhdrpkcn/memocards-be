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

type Difficulty = 'easy' | 'medium' | 'hard';

type WordPairDto = {
  wordId: number;
  front: string;
  back: string;
};

type WordSetSummaryDto = {
  id: number;
  name: string;
  description?: string;
  difficulty: Difficulty;
  wordCount: number;
};

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
    difficulty?: Difficulty;
  }): Promise<WordSetSummaryDto[]> {
    const { fromLanguageCode, toLanguageCode, difficulty } = params;

    const where: Partial<Pick<WordSet, 'difficulty'>> = {};
    if (difficulty) where.difficulty = difficulty;

    const sets = await this.wordSetRepo.find(where, {
      populate: ['words.translations'],
    });

    const hasPair = Boolean(fromLanguageCode && toLanguageCode);

    if (!hasPair) {
      return sets.map((ws) => this.mapWordSetSummary(ws));
    }

    return sets
      .map((ws) =>
        this.mapWordSetSummary(ws, fromLanguageCode!, toLanguageCode!),
      )
      .filter((dto) => dto.wordCount > 0);
  }

  async getWordsForSet(
    wordSetId: number,
    fromLanguageCode: string,
    toLanguageCode: string,
  ) {
    const wordSet = await this.findWordSetOrThrow(wordSetId);

    const words = this.extractPairsWords(
      wordSet,
      fromLanguageCode,
      toLanguageCode,
    );

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
    const wordSet = await this.findWordSetOrThrow(wordSetId);

    const allWords = wordSet.words.getItems();
    const wordIds = allWords.map((w) => w.id);

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

    const words = allWords.flatMap((word) => {
      if (!progressedWordIds.has(word.id)) return [];

      const pair = this.extractWordPair(word, fromLanguageCode, toLanguageCode);
      return pair ? [pair] : [];
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

  private async findWordSetOrThrow(wordSetId: number): Promise<WordSet> {
    const wordSet = await this.wordSetRepo.findOne(
      { id: wordSetId },
      { populate: ['words.translations'] },
    );

    if (!wordSet) {
      throw new NotFoundException(`WordSet ${wordSetId} not found`);
    }

    return wordSet;
  }

  private mapWordSetSummary(
    ws: WordSet,
    fromLanguageCode?: string,
    toLanguageCode?: string,
  ): WordSetSummaryDto {
    return {
      id: ws.id,
      name: ws.name,
      description: ws.description,
      difficulty: ws.difficulty as Difficulty,
      wordCount: this.countWordsForPair(ws, fromLanguageCode, toLanguageCode),
    };
  }

  private countWordsForPair(
    ws: WordSet,
    fromLanguageCode?: string,
    toLanguageCode?: string,
  ): number {
    const words = ws.words.getItems();

    if (!fromLanguageCode || !toLanguageCode) {
      return words.length;
    }

    return words.reduce((acc, word) => {
      const hasPair = Boolean(
        this.extractWordPair(word, fromLanguageCode, toLanguageCode),
      );
      return acc + (hasPair ? 1 : 0);
    }, 0);
  }

  private extractPairsWords(
    ws: WordSet,
    fromLanguageCode: string,
    toLanguageCode: string,
  ): WordPairDto[] {
    return ws.words.getItems().flatMap((word) => {
      const pair = this.extractWordPair(word, fromLanguageCode, toLanguageCode);
      return pair ? [pair] : [];
    });
  }

  private extractWordPair(
    word: Word,
    fromLanguageCode: string,
    toLanguageCode: string,
  ): WordPairDto | null {
    const translations = word.translations.getItems();

    const from = translations.find((t) => t.languageCode === fromLanguageCode);
    const to = translations.find((t) => t.languageCode === toLanguageCode);

    if (!from || !to) return null;

    return {
      wordId: word.id,
      front: from.text,
      back: to.text,
    };
  }
}
