import { 
  IsBoolean, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  MaxLength, 
  MinLength, 
  IsDateString,
  Matches,
  ValidateIf,
  Validate
} from "class-validator";
import { UserGene } from "src/common/enums/gene.enum";
import { BautismoEstado } from "src/common/enums/bautismo-estado.enum";
import { Type } from "class-transformer";
import { 
  IsValidCedula, 
  IsValidPhone, 
  IsValidBautismoDate,
  IsValidBirthDate,
  IsValidIngresoDate 
} from "../../common/validators/custom.validators";

export class CreateMiembroDto {
  @IsString({ message: 'Los nombres deben ser texto' })
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @MaxLength(100, { message: 'Los nombres no pueden exceder los 100 caracteres' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MaxLength(100, { message: 'Los apellidos no pueden exceder los 100 caracteres' })
  apellidos: string;

  @IsString({ message: 'La cédula debe ser texto' })
  @IsOptional()
  @Validate(IsValidCedula, { message: 'La cédula debe tener 11 dígitos numéricos' })
  cedula?: string;

  @IsString({ message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  @Matches(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))?$/, {
    message: 'La imagen debe ser una URL válida (png, jpg, jpeg, gif, webp, svg)'
  })
  img?: string;

  @IsEnum(UserGene, { message: 'El género debe ser MASCULINO o FEMENINO' })
  @IsNotEmpty({ message: 'El género es obligatorio' })
  genero: UserGene;

  @IsString({ message: 'El puesto debe ser texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El puesto no puede exceder los 50 caracteres' })
  puesto?: string;

  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha válida' })
  @IsOptional()
  @Validate(IsValidIngresoDate, { 
    message: 'La fecha de ingreso no puede ser futura' 
  })
  fecha_ingreso?: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @Validate(IsValidBirthDate, { 
    message: 'La fecha de nacimiento debe ser válida (entre 1 y 100 años)' 
  })
  fecha_nacimiento: string;

  @IsString({ message: 'La dirección debe ser texto' })
  @IsOptional()
  @MaxLength(500, { message: 'La dirección no puede exceder los 500 caracteres' })
  direccion?: string;

  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Validate(IsValidPhone, { 
    message: 'El teléfono debe tener 10 dígitos numéricos' 
  })
  telefono: string;

  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  @IsOptional()
  @Type(() => Boolean)
  estado?: boolean;

  @IsEnum(BautismoEstado, { 
    message: 'El estado de bautismo debe ser BAUTIZADO, NO_BAUTIZADO o EN_DISCIPULADO' 
  })
  @IsNotEmpty({ message: 'El estado de bautismo es obligatorio' })
  bautismoEstado: BautismoEstado;

  @IsDateString({}, { message: 'La fecha de bautismo debe ser una fecha válida' })
  @ValidateIf(o => o.bautismoEstado === BautismoEstado.BAUTIZADO)
  @Validate(IsValidBautismoDate, {
    message: 'La fecha de bautismo es obligatoria si el estado es BAUTIZADO y no puede ser futura'
  })
  fecha_bautismo?: string;

  @IsString()
  @IsOptional()
  iglesiaId?: string; 
}