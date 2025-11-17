import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from '../mikro-orm.config';
import { Language } from '../entities/language.entity';
import { Deck } from '../entities/deck.entity';
import { Card, CardDifficulty } from '../entities/card.entity';

import * as fs from 'fs';
import * as path from 'path';

type LanguageSeed = {
  code: string;
  name: string;
};

type DeckSeedCard = {
  front: string;
  back: string;
  difficulty?: string;
};

type DeckSeed = {
  name: string;
  description?: string;
  fromLanguage: string;
  toLanguage: string;
  cards: DeckSeedCard[];
};

async function seedLanguages(orm: MikroORM, seedFilePath: string) {
  const em = orm.em.fork();

  const raw = fs.readFileSync(seedFilePath, 'utf-8');
  const parsed = JSON.parse(raw) as { languages: LanguageSeed[] };

  console.log('🌱 Seeding languages...');

  for (const lang of parsed.languages) {
    let language = await em.findOne(Language, { code: lang.code });

    if (!language) {
      language = em.create(Language, {
        code: lang.code,
        name: lang.name,
      });
      em.persist(language);
      console.log(`  ➕ Language: ${lang.code} (${lang.name})`);
    }
  }

  await em.flush();
}

async function seedDecks(orm: MikroORM, decksDir: string) {
  const em = orm.em.fork();

  const files = fs
    .readdirSync(decksDir)
    .filter((file) => file.endsWith('.json'));

  console.log('🌱 Seeding decks & cards...');

  for (const file of files) {
    const fullPath = path.join(decksDir, file);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const deckSeed = JSON.parse(raw) as DeckSeed;

    const fromLang = await em.findOne(Language, {
      code: deckSeed.fromLanguage,
    });
    const toLang = await em.findOne(Language, {
      code: deckSeed.toLanguage,
    });

    if (!fromLang || !toLang) {
      console.warn(
        `  ⚠️ Skipping deck ${deckSeed.name} – language not found (${deckSeed.fromLanguage} -> ${deckSeed.toLanguage})`,
      );
      continue;
    }

    let deck = await em.findOne(Deck, {
      name: deckSeed.name,
      fromLanguage: fromLang,
      toLanguage: toLang,
    });

    if (!deck) {
      deck = em.create(Deck, {
        name: deckSeed.name,
        description: deckSeed.description,
        fromLanguage: fromLang,
        toLanguage: toLang,
        isPublic: true,
      });
      em.persist(deck);
      console.log(
        `  ➕ Deck: ${deckSeed.name} (${deckSeed.fromLanguage} → ${deckSeed.toLanguage})`,
      );
    }

    let orderIndex = 0;

    for (const cardSeed of deckSeed.cards) {
      const existing = await em.findOne(Card, {
        deck,
        frontText: cardSeed.front,
        backText: cardSeed.back,
      });

      if (existing) {
        continue;
      }

      const difficulty =
        cardSeed.difficulty &&
        ['easy', 'medium', 'hard'].includes(cardSeed.difficulty)
          ? (cardSeed.difficulty as CardDifficulty)
          : undefined;

      const card = em.create(Card, {
        deck,
        frontText: cardSeed.front,
        backText: cardSeed.back,
        difficulty,
        orderIndex: orderIndex++,
      });

      em.persist(card);
      console.log(
        `    ➕ Card: ${cardSeed.front} → ${cardSeed.back} (${file})`,
      );
    }

    await em.flush();
  }
}

async function seed() {
  const orm = await MikroORM.init(mikroOrmConfig);

  try {
    const languagesPath = path.join(
      process.cwd(),
      'seed-data',
      'languages.json',
    );
    const decksDir = path.join(process.cwd(), 'seed-data', 'decks');

    await seedLanguages(orm, languagesPath);
    await seedDecks(orm, decksDir);

    console.log('✅ Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed', err);
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
