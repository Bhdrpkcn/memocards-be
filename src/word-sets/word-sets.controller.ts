import { Controller, Get, Param, Query } from '@nestjs/common';

import { WordSetsService } from './word-sets.service';

import { CardStatusKind } from 'src/entities/card-progress.entity';

@Controller('word-sets')
export class WordSetsController {
  constructor(private readonly wordSets: WordSetsService) {}

  @Get()
  async listWordSets(
    @Query('from') fromLanguageCode?: string,
    @Query('to') toLanguageCode?: string,
    @Query('difficulty') difficulty?: 'easy' | 'medium' | 'hard',
  ) {
    return this.wordSets.listWordSets({
      fromLanguageCode,
      toLanguageCode,
      difficulty,
    });
  }

  @Get(':id/words')
  async getWordsForSet(
    @Param('id') id: string,
    @Query('from') fromLanguageCode: string,
    @Query('to') toLanguageCode: string,
  ) {
    return this.wordSets.getWordsForSet(
      Number(id),
      fromLanguageCode,
      toLanguageCode,
    );
  }

  @Get(':id/words/progress')
  async getWordsForSetByProgress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('from') fromLanguageCode: string,
    @Query('to') toLanguageCode: string,
    @Query('status') status: CardStatusKind,
  ) {
    return this.wordSets.getWordsForSetByProgress(
      Number(id),
      Number(userId),
      fromLanguageCode,
      toLanguageCode,
      status,
    );
  }
}
