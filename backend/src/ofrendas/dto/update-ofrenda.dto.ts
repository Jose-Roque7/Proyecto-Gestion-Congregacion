import { PartialType } from '@nestjs/mapped-types';
import { CreateOfrendaDto } from './create-ofrenda.dto';

export class UpdateOfrendaDto extends PartialType(CreateOfrendaDto) {}
