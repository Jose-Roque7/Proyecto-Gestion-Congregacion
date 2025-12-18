import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOfrendaDto {

    @IsString()
    @IsNotEmpty()
    Tipo: string;

    @IsNumber()
    @IsNotEmpty()
    Total: number;

    @IsDate()
    @IsNotEmpty()
    fecha: Date;

}