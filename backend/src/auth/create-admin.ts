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

    const username = 'admin';
    const plainPassword = 'admin123';

    const existingAdmin = await adminRepo.findOne({ where: { username } });
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existingAdmin) {
      console.log(`Admin "${username}" již existuje, aktualizuji heslo...`);
      existingAdmin.password = hashedPassword;
      await adminRepo.save(existingAdmin);
      console.log(`Heslo admina bylo úspěšně aktualizováno na "${plainPassword}"`);
    } else {
      const admin = adminRepo.create({
        username,
        password: hashedPassword,
      });
      await adminRepo.save(admin);
      console.log(`Admin "${username}" byl vytvořen s heslem "${plainPassword}"`);
    }

    await dataSource.destroy();
  } catch (err) {
    console.error('Chyba při vytváření admina:', err);
  }
}

createAdmin();
