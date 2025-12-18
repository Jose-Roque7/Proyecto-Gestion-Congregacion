import { PartialType } from '@nestjs/mapped-types';
import { CreateIglesiaDto } from './create-iglesia.dto';

export class UpdateIglesiaDto extends PartialType(CreateIglesiaDto) {}
