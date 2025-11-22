export class DeckResponseDto {
  id!: number;
  name!: string;
  description?: string;
  fromLanguageCode!: string;
  toLanguageCode!: string;
  isPublic!: boolean;
  isCustom!: boolean;
  cardCount!: number;
}

export class DeckDetailResponseDto {
  id!: number;
  name!: string;
  description?: string;
  fromLanguageCode!: string;
  toLanguageCode!: string;
  isPublic!: boolean;
  isCustom!: boolean;
  cardCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateCustomDeckDto {
  userId!: number;
  name!: string;
}

export class AddCardToCustomDeckDto {
  userId!: number;
  sourceCardId!: number;
}
