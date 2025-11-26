import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { UserWordCollection } from './user-word-collection.entity';
import { Word } from './word.entity';

@Entity()
export class UserWordCollectionItem {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => UserWordCollection)
  collection!: UserWordCollection;

  @ManyToOne(() => Word)
  word!: Word;

  @Property()
  createdAt: Date = new Date();
}
