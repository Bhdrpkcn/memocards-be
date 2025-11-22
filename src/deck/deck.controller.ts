import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { DeckService } from './deck.service';
import {
  AddCardToCustomDeckDto,
  CreateCustomDeckDto,
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

  @Get(':id/custom-decks')
  async getCustomDecksForUser(
    @Param('id', ParseIntPipe) parentDeckId: number,
    @Query('userId') userIdRaw: string,
  ) {
    const userId = Number(userIdRaw);
    return this.decks.findCustomDecksForUser(parentDeckId, userId);
  }

  @Post(':id/custom-decks')
  async createCustomDeck(
    @Param('id', ParseIntPipe) parentDeckId: number,
    @Body() body: CreateCustomDeckDto,
  ) {
    return this.decks.createCustomDeckForUser(
      parentDeckId,
      body.userId,
      body.name,
    );
  }

  @Post('/custom-decks/:customDeckId/cards')
  async addCardToCustomDeck(
    @Param('customDeckId', ParseIntPipe) customDeckId: number,
    @Body() body: AddCardToCustomDeckDto,
  ) {
    await this.decks.addCardToCustomDeck(
      customDeckId,
      body.userId,
      body.sourceCardId,
    );
    return { success: true };
  }

  @Delete('/custom-decks/:customDeckId/cards/:cardId')
  async removeCardFromCustomDeck(
    @Param('customDeckId', ParseIntPipe) customDeckId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Query('userId') userIdRaw: string,
  ) {
    const userId = Number(userIdRaw);
    await this.decks.removeCardFromCustomDeck(customDeckId, userId, cardId);
    return { success: true };
  }

  @Delete('/custom-decks/:customDeckId')
  async deleteCustomDeck(
    @Param('customDeckId', ParseIntPipe) customDeckId: number,
    @Query('userId') userIdRaw: string,
  ) {
    const userId = Number(userIdRaw);
    await this.decks.deleteCustomDeck(customDeckId, userId);
    return { success: true };
  }
}
