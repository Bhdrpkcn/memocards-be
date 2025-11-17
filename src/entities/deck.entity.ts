import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './user.entity';
import { Card } from './card.entity';

@Entity()
export class Deck {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  languageFrom?: string;

  @Property({ nullable: true })
  languageTo?: string;

  @ManyToOne(() => User, { nullable: true })
  owner?: User;

  @Property({ default: true })
  isPublic: boolean = true;

  @OneToMany(() => Card, (card) => card.deck)
  cards = new Collection<Card>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
