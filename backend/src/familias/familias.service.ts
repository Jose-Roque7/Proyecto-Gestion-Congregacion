import { Injectable } from '@nestjs/common';
import { CreateFamiliasDto } from './dto/create-familia.dto';
import { FamiliaMiembroDto } from './dto/create-familia.dto';

@Injectable()
export class FamiliasService {
  
  async create(createFamiliasDto: CreateFamiliasDto) {
    const { miembros } = createFamiliasDto;
    // Aquí procesas cada miembro
    miembros.forEach(miembro => {
      console.log(miembro)
    });
    
    // Lógica para crear la familia...
  }

  async addMiembro(familiaId: number, familiaMiembroDto: FamiliaMiembroDto) {
    // Lógica para añadir miembro a familia existente
  }
}