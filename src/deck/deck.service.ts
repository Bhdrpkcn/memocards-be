import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Deck } from '../entities/deck.entity';

@Injectable()
export class DeckService {
  constructor(
    @InjectRepository(Deck)
    private readonly deckRepo: EntityRepository<Deck>,
  ) {}

  async findAll(): Promise<Deck[]> {
    return this.deckRepo.findAll();
  }

  async findById(id: number): Promise<Deck | null> {
    return this.deckRepo.findOne({ id });
  }
}
