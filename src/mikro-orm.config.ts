import { defineConfig } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';

export default defineConfig({
  entities: [User],
  entitiesTs: ['src/entities'],
  dbName: 'memocards',
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5434,
  debug: true,
});
