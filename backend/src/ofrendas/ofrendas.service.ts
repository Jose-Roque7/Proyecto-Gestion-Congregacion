import { Injectable } from '@nestjs/common';
import { CreateOfrendaDto } from './dto/create-ofrenda.dto';
import { UpdateOfrendaDto } from './dto/update-ofrenda.dto';

@Injectable()
export class OfrendasService {
  create(createOfrendaDto: CreateOfrendaDto) {
    return 'This action adds a new ofrenda';
  }

  findAll() {
    return `This action returns all ofrendas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ofrenda`;
  }

  update(id: number, updateOfrendaDto: UpdateOfrendaDto) {
    return `This action updates a #${id} ofrenda`;
  }

  remove(id: number) {
    return `This action removes a #${id} ofrenda`;
  }
}
