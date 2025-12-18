import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'int' })
  cupos: number;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFinal: Date;

  @Column({ type: 'text' })
  estado: string;

  @Column({ type: 'int', default: 0 })
  totalInscritos: number;

  @OneToMany(() => Inscripcion, inscripcion => inscripcion.curso)
  inscripciones: Inscripcion[];

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
