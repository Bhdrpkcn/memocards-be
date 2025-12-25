import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CollectionsService } from './collections.service';
import { CollectionScope } from 'src/entities/user-word-collection.entity';
import { CardStatusKind } from 'src/entities/card-progress.entity';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @Get()
  async listCollections(
    @Query('userId') userId: string,
    @Query('scope') scope?: CollectionScope,
  ) {
    return this.collections.listCollections(
      Number(userId),
      scope as CollectionScope | undefined,
    );
  }

  @Post()
  async createCollection(
    @Body()
    body: {
      userId: number;
      name: string;
      scope: CollectionScope;
      languageCode?: string;
    },
  ) {
    return this.collections.createCollection({
      userId: body.userId,
      name: body.name,
      scope: body.scope,
      languageCode: body.languageCode,
    });
  }

  @Post(':id/items')
  async addWordToCollection(
    @Param('id') id: string,
    @Body()
    body: {
      userId: number;
      wordId: number;
    },
  ) {
    return this.collections.addWordToCollection({
      userId: body.userId,
      collectionId: Number(id),
      wordId: body.wordId,
    });
  }

  @Get(':id/words')
  async getCollectionWords(
    @Param('id') id: string,
    @Query('from') fromLanguageCode: string,
    @Query('to') toLanguageCode: string,
  ) {
    return this.collections.getCollectionWords({
      collectionId: Number(id),
      fromLanguageCode,
      toLanguageCode,
    });
  }

  @Get(':id/words/progress')
  async getCollectionWordsByProgress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('from') fromLanguageCode: string,
    @Query('to') toLanguageCode: string,
    @Query('status') status: CardStatusKind,
  ) {
    return this.collections.getCollectionWordsByProgress({
      collectionId: Number(id),
      userId: Number(userId),
      fromLanguageCode,
      toLanguageCode,
      status,
    });
  }

  @Delete(':id')
  async deleteCollection(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.collections.deleteCollection({
      userId: Number(userId),
      collectionId: Number(id),
    });
  }
}
