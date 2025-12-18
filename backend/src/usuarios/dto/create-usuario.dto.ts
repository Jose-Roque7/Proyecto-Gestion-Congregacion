import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/roles.enum';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsEnum(UserRole)
  rol: UserRole;

  @IsString()
  @IsOptional()
  iglesiaId?: string; 
}
