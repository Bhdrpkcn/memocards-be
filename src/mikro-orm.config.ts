import { defineConfig } from '@mikro-orm/postgresql';

import { Language } from './entities/language.entity';
import { User } from './entities/user.entity';
import { CardProgress } from './entities/card-progress.entity';
import { WordSet } from './entities/word-set.entity';
import { Word } from './entities/word.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { UserWordCollection } from './entities/user-word-collection.entity';
import { UserWordCollectionItem } from './entities/user-word-collection-item.entity';

export default defineConfig({
  entities: [
    Language,
    User,
    WordSet,
    Word,
    WordTranslation,
    UserWordCollection,
    UserWordCollectionItem,
    CardProgress,
  ],
  dbName: process.env.DB_NAME || 'memocards',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5434,
  debug: true,
});
