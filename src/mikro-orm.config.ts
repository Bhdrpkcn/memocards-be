import { defineConfig } from '@mikro-orm/postgresql';

import { Language } from './entities/language.entity';
import { User } from './entities/user.entity';
import { Deck } from './entities/deck.entity';
import { Card } from './entities/card.entity';
import { CardProgress } from './entities/card-progress.entity';

export default defineConfig({
  entities: [Language, User, Deck, Card, CardProgress],
  dbName: process.env.DB_NAME || 'memocards',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5434,
  debug: true,
});
