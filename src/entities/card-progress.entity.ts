import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

import { User } from './user.entity';
import { Word } from './word.entity';

export enum CardStatusKind {
  NEW = 'new',
  KNOWN = 'known',
  REVIEW = 'review',
}

@Entity()
@Unique({ properties: ['user', 'word'] })
export class CardProgress {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Word)
  word!: Word;

  // High-level UI status (filtering)
  @Property({ type: 'string' })
  statusKind: CardStatusKind = CardStatusKind.NEW;

  // SM-2 fields
  @Property({ type: 'double', default: 2.5 })
  easeFactor: number = 2.5;

  @Property({ default: 0 })
  intervalDays: number = 0;

  @Property({ default: 0 })
  repetitions: number = 0;

  @Property({ nullable: true })
  nextReviewDate?: Date;

  @Property({ nullable: true })
  lastReviewedAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  fromLanguageCode!: string;

  @Property()
  toLanguageCode!: string;
}
