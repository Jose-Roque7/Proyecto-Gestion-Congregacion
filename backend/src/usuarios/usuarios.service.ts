import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/user.entity';
import { hashPassword } from '../common/utils/password-hasher';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Iglesiaconfig)
    private readonly iglesiaRepo: Repository<Iglesiaconfig>,
  ) {}

  async findOneById(id: string): Promise<Usuario> {
    const user = await this.usuarioRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<Usuario> {
    const user = await this.usuarioRepo.findOne({
      where: { email },
      relations: ['iglesia'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUsuarioDto) {
    const { email, password, iglesiaId, ...data } = dto;

    // Verificar email repetido
    const existe = await this.usuarioRepo.findOne({ where: { email } });
    if (existe) throw new BadRequestException('El email ya está en uso');

    // Verificar que la iglesia exista
    const iglesia = await this.iglesiaRepo.findOne({ where: { id: iglesiaId } });
    if (!iglesia) throw new BadRequestException('La iglesia no existe');

    const usuario = this.usuarioRepo.create({
      ...data,
      email,
      password: await hashPassword(password),
      iglesia,
      iglesia_id: iglesiaId,
    });

    await this.usuarioRepo.save(usuario);
    return usuario;
  }
}
