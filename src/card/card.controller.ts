import { Controller, Get, Param } from '@nestjs/common';

import { CardService } from './card.service';

@Controller('decks/:deckId/cards')
export class CardController {
  constructor(private readonly cards: CardService) {}

  @Get()
  async getCards(@Param('deckId') deckId: string) {
    return this.cards.findByDeck(Number(deckId));
  }
}
