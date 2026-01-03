import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Familia } from './familia.entity';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';

@Entity('familias_name')
export class Familias {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  nombre: string;

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

  @OneToMany(() => Familia, familia => familia.familia)
  miembros: Familia[];
}
