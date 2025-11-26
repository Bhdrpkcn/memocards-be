import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { Word } from './word.entity';

@Entity()
export class WordTranslation {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Word)
  word!: Word;

  @Property()
  languageCode!: string;

  @Property()
  text!: string;
}
