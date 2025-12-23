import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Familia } from '../../familias/entities/familia.entity';
import { Ofrendas } from '../../ofrendas/entities/ofrenda.entity';
import { Inscripcion } from '../../cursos/entities/inscripcion.entity';
import { UserGene } from 'src/common/enums/gene.enum';
import { BautismoEstado } from 'src/common/enums/bautismo-estado.enum';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';

@Entity('miembros')
export class Miembro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ 
    type: 'varchar', 
    length: 11, 
    nullable: true, 
    unique: true 
  })
  cedula: string;

  @Column({ type: 'text', nullable: true })
  img: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    default: 'Miembro' 
  })
  puesto: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({
    type: 'enum',
    enum: UserGene,
    default: UserGene.MASCULINO,
  })
  genero: UserGene;

  @Column({ 
    type: 'varchar', 
    length: 10, 
    nullable: false 
  })
  telefono: string;

  @Column({ 
    type: 'date',
    nullable: false 
  })
  fecha_nacimiento: Date;

  @Column({ 
    type: 'date', 
    nullable: true 
  })
  fecha_ingreso: Date;

    @ManyToOne(() => Iglesiaconfig)
    @JoinColumn({ name: 'iglesia_id' })
    iglesia: Iglesiaconfig;
  
    @Column()
    iglesia_id: string;

  @Column({ 
    type: 'boolean', 
    default: true 
  })
  estado: boolean;

  @Column({
    type: 'enum',
    enum: BautismoEstado,
    default: BautismoEstado.NO_BAUTIZADO,
  })
  bautismoEstado: BautismoEstado;

  @Column({ 
    type: 'date', 
    nullable: true 
  })
  fecha_bautismo: Date;

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

  @OneToMany(() => Familia, familia => familia.miembro)
  familias: Familia[];

  @OneToMany(() => Ofrendas, ofrendas => ofrendas.miembro)
  ofrendas: Ofrendas[];

  @OneToMany(() => Inscripcion, inscripcion => inscripcion.miembro)
  inscripciones: Inscripcion[];
}