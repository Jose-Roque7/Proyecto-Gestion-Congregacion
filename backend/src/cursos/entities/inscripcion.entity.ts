import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Miembro } from '../../miembros/entities/miembro.entity';
import { Curso } from './curso.entity';

@Entity('inscripciones')
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  // FK a miembro
  @ManyToOne(() => Miembro, miembro => miembro.inscripciones, {
    nullable: true,
    onDelete: 'SET NULL',   // <<< LO QUE PEDISTE
  })
  @JoinColumn({ name: 'miembro_id' })
  miembro: Miembro;

  @Column({ name: 'miembro_id', type: 'uuid', nullable: true })
  miembroId: string | null;

  // FK a curso
  @ManyToOne(() => Curso, curso => curso.inscripciones, {
    onDelete: 'CASCADE',     // si borras un curso, borran las inscripciones
  })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  @Column({ name: 'curso_id', type: 'int' })
  cursoId: number;

  @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp'
    })
  createdAt: Date;
    
  @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp'
    })
   pdatedAt: Date;

}
