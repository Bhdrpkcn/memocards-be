import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DeckService } from './deck.service';
import {
  DeckDetailResponseDto,
  DeckResponseDto,
} from './dto/deck-response.dto';

@Controller('decks')
export class DeckController {
  constructor(private readonly decks: DeckService) {}

  @Get()
  async getDecks(): Promise<DeckResponseDto[]> {
    return this.decks.findAll();
  }

  @Get(':id')
  async getDeck(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeckDetailResponseDto> {
    return this.decks.findById(id);
  }
}
