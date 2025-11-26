import { Body, Controller, Param, Post } from '@nestjs/common';

import { CardStatusKind } from '../entities/card-progress.entity';

import { ProgressService } from './progress.service';

type UpdateProgressDto = {
  userId: number;
  fromLanguageCode: string;
  toLanguageCode: string;
  status: CardStatusKind;
};

@Controller('words/:wordId/progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post()
  async updateStatus(
    @Param('wordId') wordId: string,
    @Body() body: UpdateProgressDto,
  ) {
    // TODO: later userId should come from JWT (req.user.id)
    return this.progress.setStatus(
      body.userId,
      Number(wordId),
      body.fromLanguageCode,
      body.toLanguageCode,
      body.status,
    );
  }
}
