import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsArray, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";
import { UserRol } from "src/common/enums/rol-families.enum";

export class FamiliaMiembroDto {
    @IsEnum(UserRol)
    @IsNotEmpty()
    rol: UserRol

    @IsString()
    @IsOptional()
    iglesiaId?: string; 

    @IsUUID()
    @IsNotEmpty()
    miembroId: string;

    @IsNumber()
    @IsNotEmpty()
    familiaId: number;
}

export class CreateFamiliasDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FamiliaMiembroDto)
    @IsNotEmpty()
    miembros: FamiliaMiembroDto[];
}
