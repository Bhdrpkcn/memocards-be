import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

import { User } from '../entities/user.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';
import { UserWordCollection } from 'src/entities/user-word-collection.entity';
import { UserWordCollectionItem } from 'src/entities/user-word-collection-item.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      UserWordCollection,
      UserWordCollectionItem,
      Word,
      WordTranslation,
    ]),
  ],
  providers: [CollectionsService],
  controllers: [CollectionsController],
})
export class CollectionsModule {}
