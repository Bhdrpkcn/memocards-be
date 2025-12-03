import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { WordSet } from '../entities/word-set.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { CardProgress } from 'src/entities/card-progress.entity';

import { WordSetsService } from './word-sets.service';
import { WordSetsController } from './word-sets.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([WordSet, Word, WordTranslation, CardProgress]),
  ],
  providers: [WordSetsService],
  controllers: [WordSetsController],
})
export class WordSetsModule {}
