import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { CardService } from './card.service';
import { CardResponseDto } from './dto/card-response.dto';

@Controller('decks/:deckId/cards')
export class CardController {
  constructor(private readonly cards: CardService) {}

  @Get()
  async getCardsForDeck(
    @Param('deckId', ParseIntPipe) deckId: number,
    @Query('userId') userIdRaw?: string,
    @Query('status') status?: string,
  ): Promise<CardResponseDto[]> {
    const userId =
      userIdRaw !== undefined && userIdRaw !== null
        ? Number(userIdRaw)
        : undefined;

    return this.cards.findByDeck(deckId, userId, status);
  }
}
