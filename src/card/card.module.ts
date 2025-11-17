import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Card } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';

import { CardService } from './card.service';
import { CardController } from './card.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Card, Deck])],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
