import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Language {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
