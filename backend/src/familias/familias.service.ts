import { Injectable } from '@nestjs/common';
import { CreateFamiliaDto } from './dto/create-familia.dto';
import { UpdateFamiliaDto } from './dto/update-familia.dto';

@Injectable()
export class FamiliasService {
  create(createFamiliaDto: CreateFamiliaDto) {
    return 'This action adds a new familia';
  }

  findAll() {
    return `This action returns all familias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} familia`;
  }

  update(id: number, updateFamiliaDto: UpdateFamiliaDto) {
    return `This action updates a #${id} familia`;
  }

  remove(id: number) {
    return `This action removes a #${id} familia`;
  }
}
