import { PartialType } from '@nestjs/mapped-types';
import { CreateFamiliaNameDto } from './create-familia-name.dto';

export class UpdateFamiliaNameDto extends PartialType(CreateFamiliaNameDto) {}
