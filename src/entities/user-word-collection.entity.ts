import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { User } from './user.entity';
import { UserWordCollectionItem } from './user-word-collection-item.entity';

export enum CollectionScope {
  LANGUAGE = 'LANGUAGE',
  GLOBAL = 'GLOBAL',
}

@Entity()
export class UserWordCollection {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  name!: string;

  @Property()
  scope!: CollectionScope;

  @Property({ nullable: true })
  languageCode?: string;

  @OneToMany(() => UserWordCollectionItem, (item) => item.collection)
  items = new Collection<UserWordCollectionItem>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
