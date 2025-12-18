import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Iglesiaconfig } from './entities/iglesia.entity';

@Injectable()
export class IglesiaService {
  constructor(
    @InjectRepository(Iglesiaconfig)
    private readonly repo: Repository<Iglesiaconfig>,
  ) {}

  async findById(id: string) {
    const iglesia = await this.repo.findOne({ where: { id } });
    if (!iglesia) throw new NotFoundException('Iglesia no encontrada');
    return iglesia;
  }

  async findAll() {
    return this.repo.find();
  }
}
