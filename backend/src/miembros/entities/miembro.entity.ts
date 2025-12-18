import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Familia } from '../../familias/entities/familia.entity';
import { Ofrendas } from '../../ofrendas/entities/ofrenda.entity';
import { Inscripcion } from '../../cursos/entities/inscripcion.entity';
import { UserGene } from 'src/common/enums/gene.enum';

@Entity('miembros')
export class Miembro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text', nullable: true, unique: true })
  cedula: string;

  @Column({ type: 'text', nullable: true })
  img: string;

  @Column({ type: 'text', default: 'miembro' })
  puesto: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({
      type: 'enum',
      enum: UserGene,
      default: UserGene.MALE,
    })
    genero: UserGene;

  @Column({ type: 'varchar', length: 10, nullable: true })
  telefono: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ type: 'date', nullable: true })
  fecha_ingreso: Date;

  @Column('uuid')
  iglesiaId: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Familia, familia => familia.miembro)
  familias: Familia[];

  @OneToMany(() => Ofrendas, ofrendas => ofrendas.miembro)
  ofrendas: Ofrendas[];

  // ➤ Relación con inscripciones
  @OneToMany(() => Inscripcion, inscripcion => inscripcion.miembro)
  inscripciones: Inscripcion[];
}
