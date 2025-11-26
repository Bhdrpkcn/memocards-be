import { Migration } from '@mikro-orm/migrations';

export class Migration20251126091302_InitialSchema extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "language" ("id" serial primary key, "code" varchar(255) not null, "name" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "language" add constraint "language_code_unique" unique ("code");`);

    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "name" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "user_word_collection" ("id" serial primary key, "user_id" int not null, "name" varchar(255) not null, "scope" varchar(255) not null, "language_code" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "word_set" ("id" serial primary key, "name" varchar(255) not null, "description" varchar(255) null, "difficulty" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "word" ("id" serial primary key, "word_set_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "user_word_collection_item" ("id" serial primary key, "collection_id" int not null, "word_id" int not null, "created_at" timestamptz not null);`);

    this.addSql(`create table "card_progress" ("id" serial primary key, "user_id" int not null, "word_id" int not null, "status_kind" varchar(255) not null default 'new', "ease_factor" double precision not null default 2.5, "interval_days" int not null default 0, "repetitions" int not null default 0, "next_review_date" timestamptz null, "last_reviewed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "from_language_code" varchar(255) not null, "to_language_code" varchar(255) not null);`);
    this.addSql(`alter table "card_progress" add constraint "card_progress_user_id_word_id_unique" unique ("user_id", "word_id");`);

    this.addSql(`create table "word_translation" ("id" serial primary key, "word_id" int not null, "language_code" varchar(255) not null, "text" varchar(255) not null);`);

    this.addSql(`alter table "user_word_collection" add constraint "user_word_collection_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "word" add constraint "word_word_set_id_foreign" foreign key ("word_set_id") references "word_set" ("id") on update cascade;`);

    this.addSql(`alter table "user_word_collection_item" add constraint "user_word_collection_item_collection_id_foreign" foreign key ("collection_id") references "user_word_collection" ("id") on update cascade;`);
    this.addSql(`alter table "user_word_collection_item" add constraint "user_word_collection_item_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade;`);

    this.addSql(`alter table "card_progress" add constraint "card_progress_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "card_progress" add constraint "card_progress_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade;`);

    this.addSql(`alter table "word_translation" add constraint "word_translation_word_id_foreign" foreign key ("word_id") references "word" ("id") on update cascade;`);
  }

}
