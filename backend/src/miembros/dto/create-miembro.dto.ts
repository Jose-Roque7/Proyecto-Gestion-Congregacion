import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { UserGene } from "src/common/enums/gene.enum";

export class CreateMiembroDto {

      @IsString()
      @IsNotEmpty()
      nombres: string;
    
      @IsString()
      @IsNotEmpty()
      apellidos: string;
    
      @IsString()
      @IsOptional()
      cedula?: string;
    
      @IsString()
      @IsOptional()
      img?: string;

      @IsEnum(UserGene)
      genero: UserGene;

      @IsOptional()
      @IsUUID()
      iglesiaId?: string;
    
      @IsString()
      @IsOptional()
      puesto?: string;
    
      @IsString()
      @IsOptional()
      fecha_ingreso?: string

      @IsString()
      @IsNotEmpty()
      fecha_nacimiento: string


      @IsString()
      @IsOptional()
      direccion?: string

      @IsString()
      @MaxLength(10)
      @MinLength(10)    
      telefono: string
    
      @IsBoolean()
      @IsOptional()
      estado?: boolean;

}
