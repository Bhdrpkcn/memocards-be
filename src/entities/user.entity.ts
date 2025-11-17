import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
} from '@mikro-orm/core';

import { CardProgress } from './card-progress.entity';
import { Deck } from './deck.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property({ nullable: true })
  name?: string;

  @OneToMany(() => Deck, (deck) => deck.owner)
  decks = new Collection<Deck>(this);

  @OneToMany(() => CardProgress, (progress) => progress.user)
  cardProgress = new Collection<CardProgress>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
