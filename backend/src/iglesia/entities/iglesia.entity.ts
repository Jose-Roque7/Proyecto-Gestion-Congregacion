import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('iglesiaconfig')
export class Iglesiaconfig {

    @PrimaryGeneratedColumn('uuid')
      id: string;

    @Column('text')
      nombres: string;

    @Column('text')
      logo: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
      createdAt: Date;
      
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
      updatedAt: Date;
    
}
