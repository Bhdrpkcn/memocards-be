import { Migration } from '@mikro-orm/migrations';

export class Migration20251117082140_InitialSchema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "deck" ("id" serial primary key, "name" varchar(255) not null, "description" varchar(255) null, "language_from" varchar(255) null, "language_to" varchar(255) null, "owner_id" int null, "is_public" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "card" ("id" serial primary key, "deck_id" int not null, "front_text" varchar(255) not null, "back_text" varchar(255) not null, "extra_info" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "card_progress" ("id" serial primary key, "user_id" int not null, "card_id" int not null, "status_kind" varchar(255) not null default 'unknown', "ease_factor" double precision not null default 2.5, "interval_days" int not null default 0, "repetitions" int not null default 0, "next_review_date" timestamptz null, "last_reviewed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "card_progress" add constraint "card_progress_user_id_card_id_unique" unique ("user_id", "card_id");`);

    this.addSql(`alter table "deck" add constraint "deck_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "card" add constraint "card_deck_id_foreign" foreign key ("deck_id") references "deck" ("id") on update cascade;`);

    this.addSql(`alter table "card_progress" add constraint "card_progress_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "card_progress" add constraint "card_progress_card_id_foreign" foreign key ("card_id") references "card" ("id") on update cascade;`);
  }

}
