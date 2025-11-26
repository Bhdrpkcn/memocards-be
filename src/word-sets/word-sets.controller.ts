import { Controller, Get, Param, Query } from '@nestjs/common';

import { WordSetsService } from './word-sets.service';

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
}
