import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Miembro } from '../../miembros/entities/miembro.entity';
import { Familias } from './familias.entity';

@Entity('familia')
export class Familia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Miembro, miembro => miembro.familias, { onDelete: 'CASCADE' })
  miembro: Miembro;

  @Column({ type: 'varchar' })
  rol: string;

  @ManyToOne(() => Familias, familia => familia.miembros, { onDelete: 'CASCADE' })
  familia: Familias;

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
