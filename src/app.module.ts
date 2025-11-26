import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';

import { UserModule } from './user/user.module';
import { ProgressModule } from './progress/progress.module';
import { WordSetsModule } from './word-sets/word-sets.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    UserModule,
    WordSetsModule,
    ProgressModule,
    CollectionsModule,
    // later: AuthModule
  ],
})
export class AppModule {}
