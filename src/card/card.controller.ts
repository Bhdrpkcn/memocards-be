import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { CardService } from './card.service';
import { CardResponseDto } from './dto/card-response.dto';

@Controller('decks/:deckId/cards')
export class CardController {
  constructor(private readonly cards: CardService) {}

  @Get()
  async getCardsForDeck(
    @Param('deckId', ParseIntPipe) deckId: number,
  ): Promise<CardResponseDto[]> {
    return this.cards.findByDeck(deckId);
  }
}
