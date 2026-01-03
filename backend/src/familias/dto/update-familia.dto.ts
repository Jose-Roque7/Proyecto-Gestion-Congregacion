import { PartialType } from '@nestjs/mapped-types';
import { CreateFamiliasDto } from './create-familia.dto';

export class UpdateFamiliasDto extends PartialType(CreateFamiliasDto) {}
