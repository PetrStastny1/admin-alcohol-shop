import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { Admin } from './admin.entity';

config();

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_db',
    entities: [Admin],
    synchronize: false,
  });

  try {
    await dataSource.initialize();

    const adminRepo = dataSource.getRepository(Admin);

    const existingAdmin = await adminRepo.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin "admin" již existuje, aktualizuji heslo...');
      existingAdmin.password = await bcrypt.hash('heslo', 10);
      await adminRepo.save(existingAdmin);
      console.log('Heslo admina bylo úspěšně aktualizováno na "heslo"');
    } else {
      const hashedPassword = await bcrypt.hash('heslo', 10);
      const admin = adminRepo.create({
        username: 'admin',
        password: hashedPassword,
      });
      await adminRepo.save(admin);
      console.log('Admin "admin" byl vytvořen s heslem "heslo"');
    }

    await dataSource.destroy();
  } catch (err) {
    console.error('Chyba při vytváření admina:', err);
  }
}

createAdmin();
