// src/entities/card.entity.ts
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

  @OneToMany(() => CardProgress, (progress) => progress.card)
  progresses = new Collection<CardProgress>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
