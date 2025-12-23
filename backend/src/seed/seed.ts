// src/seed/seed.ts
import { DataSource } from 'typeorm';
import { Iglesiaconfig } from '../iglesia/entities/iglesia.entity';
import { hashPassword } from '../common/utils/password-hasher';
import { Usuario } from '../usuarios/entities/user.entity';
import { UserRole } from '../common/enums/roles.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost', // << cambiar por tu ip
    port: 5432,
    username: 'sysdba',
    password: 'masterkey',
    database: 'congregation',
    entities: [Iglesiaconfig, Usuario],
    synchronize: true,
  });

  await dataSource.initialize();

  // 1️⃣ Crear Iglesia
  const iglesiaRepo = dataSource.getRepository(Iglesiaconfig);
  const iglesia = iglesiaRepo.create({
    nombres: 'Iglesia de prueba',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy27eVuF9HH-q15yVcxLXl4uxxM8Mjb3si0w&s',
  });
  await iglesiaRepo.save(iglesia);

  // 2️⃣ Crear SUPER_ADMIN
  const usuarioRepo = dataSource.getRepository(Usuario);
  const admin = usuarioRepo.create({
    nombre: 'Pastor',
    email: 'a@a.com',
    password: hashPassword('123'),
    rol: UserRole.ROOT,
    iglesia_id: iglesia.id,
  });
  await usuarioRepo.save(admin);

  console.log('✅ Iglesia y SUPER_ADMIN creados con éxito');
  await dataSource.destroy();
}

seed();
//npx ts-node src/seed/seed.ts