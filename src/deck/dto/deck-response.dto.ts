export class DeckResponseDto {
  id!: number;
  name!: string;
  description?: string;
  fromLanguageCode!: string;
  toLanguageCode!: string;
  isPublic!: boolean;
  cardCount!: number;
}

export class DeckDetailResponseDto {
  id!: number;
  name!: string;
  description?: string;
  fromLanguageCode!: string;
  toLanguageCode!: string;
  isPublic!: boolean;
  cardCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
