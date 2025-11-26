import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CardProgress } from '../entities/card-progress.entity';

import { User } from '../entities/user.entity';

import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { Word } from 'src/entities/word.entity';

@Module({
  imports: [MikroOrmModule.forFeature([CardProgress, Word, User])],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
