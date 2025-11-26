import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { Word } from './word.entity';

@Entity()
export class WordSet {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  difficulty!: 'easy' | 'medium' | 'hard';

  @OneToMany(() => Word, (word) => word.wordSet)
  words = new Collection<Word>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
