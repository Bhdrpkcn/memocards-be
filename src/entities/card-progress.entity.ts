import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

import { User } from './user.entity';
import { Card } from './card.entity';

export enum CardStatusKind {
  UNKNOWN = 'unknown',
  KNOWN = 'known',
  REVIEW = 'review',
}

@Entity()
@Unique({ properties: ['user', 'card'] })
export class CardProgress {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Card)
  card!: Card;

  // High-level UI status (filtering)
  @Property({ type: 'string' })
  statusKind: CardStatusKind = CardStatusKind.UNKNOWN;

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
}
