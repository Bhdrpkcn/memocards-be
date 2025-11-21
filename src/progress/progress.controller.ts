import { Body, Controller, Param, Post } from '@nestjs/common';

import { CardStatusKind } from '../entities/card-progress.entity';

import { ProgressService } from './progress.service';

@Controller('cards/:cardId/progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post()
  async updateStatus(
    @Param('cardId') cardId: string,
    @Body() body: { userId: number; status: CardStatusKind },
  ) {
    // TODO: userId is taken from body >> Later will be taken it from JWT (req.user.id)
    return this.progress.setStatus(body.userId, Number(cardId), body.status);
  }
}
