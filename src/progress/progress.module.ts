import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CardProgress } from '../entities/card-progress.entity';
import { Card } from '../entities/card.entity';
import { User } from '../entities/user.entity';

import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [MikroOrmModule.forFeature([CardProgress, Card, User])],
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
