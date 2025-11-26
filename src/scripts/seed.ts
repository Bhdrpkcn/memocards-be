import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from '../mikro-orm.config';

import * as fs from 'fs';
import * as path from 'path';

import { WordSet } from '../entities/word-set.entity';
import { Word } from '../entities/word.entity';
import { WordTranslation } from '../entities/word-translation.entity';

type WordFile = {
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  words: Record<string, string>[];
};

async function seed() {
  const orm = await MikroORM.init(mikroOrmConfig);
  const em = orm.em.fork();

  try {
    //const decksPath = path.join(__dirname, '../../seed-data/decks');
    const decksPath = path.join(process.cwd(), 'seed-data', 'decks');

    const files = fs
      .readdirSync(decksPath)
      .filter((f) => f.endsWith('-words.json'));

    console.log('Seeding word sets from:', decksPath);

    for (const file of files) {
      const fullPath = path.join(decksPath, file);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const json = JSON.parse(raw) as WordFile;

      const wordSet = em.create(WordSet, {
        name: json.name,
        description: json.description,
        difficulty: json.difficulty,
      });
      em.persist(wordSet);

      for (const cardObj of json.words) {
        const word = em.create(Word, { wordSet });
        em.persist(word);

        for (const [langCode, text] of Object.entries(cardObj)) {
          if (!text) continue;

          const translation = em.create(WordTranslation, {
            word,
            languageCode: langCode,
            text,
          });
          em.persist(translation);
        }
      }

      await em.flush();
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed', err);
    throw err;
  } finally {
    await orm.close();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding error', err);
    process.exit(1);
  });
