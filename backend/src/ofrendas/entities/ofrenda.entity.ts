import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Miembro } from '../../miembros/entities/miembro.entity';

@Entity('ofrendas')
export class Ofrendas {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ type: 'text' })
    Tipo: string;

  @Column({ type: 'float' })
    Total: number;

  @ManyToOne(() => Miembro, miembro => miembro.ofrendas, { onDelete: 'CASCADE', nullable: true })
    miembro: Miembro;

  @Column({ type: 'date' })
    fecha: Date;

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
