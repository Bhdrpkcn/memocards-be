import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { WordSet } from './word-set.entity';
import { WordTranslation } from './word-translation.entity';

@Entity()
export class Word {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => WordSet)
  wordSet!: WordSet;

  @OneToMany(() => WordTranslation, (t) => t.word)
  translations = new Collection<WordTranslation>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
