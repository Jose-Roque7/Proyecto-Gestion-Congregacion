import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Miembro } from '../../miembros/entities/miembro.entity';
import { Familias } from './familias.entity';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';
import { UserRol } from 'src/common/enums/rol-families.enum';

@Entity('familia')
export class Familia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Miembro, miembro => miembro.familias, { onDelete: 'CASCADE' })
  miembro: Miembro;

  @Column({ type: 'enum', enum: UserRol })
  rol: UserRol;

  @ManyToOne(() => Familias, familia => familia.miembros, { onDelete: 'CASCADE' })
  familia: Familias;

  @ManyToOne(() => Iglesiaconfig)
  @JoinColumn({ name: 'iglesia_id' })
  iglesia: Iglesiaconfig;
    
  @Column()
    iglesia_id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp'
  })
  updatedAt: Date;
}
