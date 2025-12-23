import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateMiembroDto } from './dto/create-miembro.dto';
import { UpdateMiembroDto } from './dto/update-miembro.dto';
import { validate as IsUUID } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Miembro } from './entities/miembro.entity';
import { Repository } from 'typeorm';
import { resourceLimits } from 'node:worker_threads';
import { GetWebsocketsGateway } from 'src/get-websockets/get-websockets.gateway';


@Injectable()
export class MiembrosService {
  private readonly logger = new Logger('MiembrosService');
  constructor( 
    @InjectRepository(Miembro)
    private readonly miembroRepository: Repository<Miembro>,
    private readonly wss: GetWebsocketsGateway,
   ){}


  async create(createMiembroDto: CreateMiembroDto) {
    try{
    const {iglesiaId, ...data} = createMiembroDto;
    const existe = await this.miembroRepository.findOne({ where: { cedula: data.cedula } });
    if (existe) throw new BadRequestException('Esta cédula ya está en uso');
    const result = await this.miembroRepository.create({
      ...data,
      iglesia_id: iglesiaId
    });
    this.miembroRepository.save(result);
    const {createdAt, updatedAt, id, ...rest} = result;
    return rest;
    }catch(err){
      this.handleDbExeption(err);
    }
  }

  async findAll( iglesia : string) {
    const result = await this.miembroRepository.find({ where: { iglesia_id: iglesia },
      relations: ['familias'],
    });
    const miembros = result.map(({ createdAt, updatedAt, familias, ...rest }) =>
      ({...rest, familias:familias.map(familia => familia.rol)}));
    return miembros;
  }

  findOne(id: number) {
    return `This action returns a #${id} miembro`;
  }

  update(id: number, updateMiembroDto: UpdateMiembroDto) {
    return `This action updates a #${id} miembro`;
  }

  remove(id: number) {
    return `This action removes a #${id} miembro`;
  }

  private handleDbExeption(err : any){
    if(err.code === '23505'){
      throw new BadRequestException(err.detail);
    }
    if(err.code === '23502'){
      throw new BadRequestException(`Field '${err.column}' cannot be null`);
    }
    if (err.driverError && err.driverError.message) {
      this.logger.error(`[${err.code || 'DB_ERROR'}] ${err.driverError.message}`);
    } else if (err.message) {
      this.logger.error(err.message);
    } else {
      this.logger.error('An error occurred:', JSON.stringify(err, null, 2));
    }
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
