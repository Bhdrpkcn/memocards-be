import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { Deck } from '../entities/deck.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';

import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { Language } from 'src/entities/language.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Deck, Language, Card, User])],
  providers: [DeckService],
  controllers: [DeckController],
  exports: [DeckService],
})
export class DeckModule {}
