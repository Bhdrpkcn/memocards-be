import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { Deck } from './deck.entity';
import { CardProgress } from './card-progress.entity';
import { User } from './user.entity';

export enum CardDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity()
export class Card {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Deck)
  deck!: Deck;

  @Property()
  frontText!: string;

  @Property()
  backText!: string;

  @Property({ nullable: true })
  extraInfo?: string;

  @Property({ type: 'string', nullable: true })
  difficulty?: CardDifficulty;

  @Property({ default: 0 })
  orderIndex: number = 0;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @OneToMany(() => CardProgress, (progress) => progress.card)
  progresses = new Collection<CardProgress>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
