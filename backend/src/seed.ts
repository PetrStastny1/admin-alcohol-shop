import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';
import { CustomersService } from './customers/customers.service';
import { OrdersService } from './orders/orders.service';
import { UsersService } from './users/users.service';

export async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const categoriesService = app.get(CategoriesService);
  const productsService = app.get(ProductsService);
  const customersService = app.get(CustomersService);
  const ordersService = app.get(OrdersService);
  const usersService = app.get(UsersService);

  console.log('🔄 Reset DB (seed)...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);

    await queryRunner.query(`DELETE FROM \`orders\`;`);
    await queryRunner.query(`ALTER TABLE \`orders\` AUTO_INCREMENT = 1;`);

    await queryRunner.query(`DELETE FROM \`products\`;`);
    await queryRunner.query(`ALTER TABLE \`products\` AUTO_INCREMENT = 1;`);

    await queryRunner.query(`DELETE FROM \`categories\`;`);
    await queryRunner.query(`ALTER TABLE \`categories\` AUTO_INCREMENT = 1;`);

    await queryRunner.query(`DELETE FROM \`customers\`;`);
    await queryRunner.query(`ALTER TABLE \`customers\` AUTO_INCREMENT = 1;`);

    await queryRunner.query(`DELETE FROM \`users\`;`);
    await queryRunner.query(`ALTER TABLE \`users\` AUTO_INCREMENT = 1;`);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    console.log('✅ DB cleaned');

    await categoriesService.onModuleInit();
    await productsService.onModuleInit();
    await customersService.onModuleInit();
    await ordersService.onModuleInit();

    const defaultUsers = [
      { email: 'admin@example.com', username: 'admin', password: 'admin123', role: 'admin' },
      { email: 'user1@example.com', username: 'user1', password: 'password1', role: 'user' },
      { email: 'user2@example.com', username: 'user2', password: 'password2', role: 'user' },
      { email: 'user3@example.com', username: 'user3', password: 'password3', role: 'user' },
      { email: 'user4@example.com', username: 'user4', password: 'password4', role: 'user' },
      { email: 'user5@example.com', username: 'user5', password: 'password5', role: 'user' },
    ];

    for (const u of defaultUsers) {
      const existing = await usersService.findOneByEmail(u.email);
      if (!existing) {
        await usersService.create(u);
      }
    }

    console.log('✅ Users seeded');
    console.log('✅ DB fully seeded');
  } catch (err) {
    console.error('❌ Chyba při seedování:', err);
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🌱 Seed dokončen (samostatné spuštění)');
    process.exit(0);
  });
}
