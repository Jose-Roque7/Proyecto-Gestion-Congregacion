import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateFamiliaNameDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsUUID()
    @IsOptional()
    iglesiaId?: string; 
}
