import { Controller, Get, Param } from '@nestjs/common';

import { DeckService } from './deck.service';

@Controller('decks')
export class DeckController {
  constructor(private readonly decks: DeckService) {}

  @Get()
  async getDecks() {
    return this.decks.findAll();
  }

  @Get(':id')
  async getDeck(@Param('id') id: string) {
    return this.decks.findById(Number(id));
  }
}
