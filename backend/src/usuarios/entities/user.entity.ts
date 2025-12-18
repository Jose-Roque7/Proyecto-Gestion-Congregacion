import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Iglesiaconfig } from '../../iglesia/entities/iglesia.entity';
import { UserRole } from '../../common/enums/roles.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  rol: UserRole;

  @ManyToOne(() => Iglesiaconfig)
  @JoinColumn({ name: 'iglesia_id' })
  iglesia: Iglesiaconfig;

  @Column()
  iglesia_id: string;
}
