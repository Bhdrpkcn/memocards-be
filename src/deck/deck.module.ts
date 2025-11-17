import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Deck } from '../entities/deck.entity';
import { Card } from '../entities/card.entity';

import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Deck, Card])],
  providers: [DeckService],
  controllers: [DeckController],
  exports: [DeckService],
})
export class DeckModule {}
