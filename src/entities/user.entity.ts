import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { CardProgress } from './card-progress.entity';
import { UserWordCollection } from './user-word-collection.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property({ nullable: true })
  name?: string;

  @OneToMany(() => UserWordCollection, (collection) => collection.user)
  collections = new Collection<UserWordCollection>(this);

  @OneToMany(() => CardProgress, (progress) => progress.user)
  cardProgress = new Collection<CardProgress>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
