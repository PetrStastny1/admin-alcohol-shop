import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders/orders.service';
import { CustomersService } from './customers/customers.service';
import { ProductsService } from './products/products.service';

export async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const ordersService = app.get(OrdersService);
  const customersService = app.get(CustomersService);
  const productsService = app.get(ProductsService);

  console.log('Reset orders + order_items ...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0;`);

    await queryRunner.query(`DELETE FROM order_item;`);
    await queryRunner.query(`ALTER TABLE order_item AUTO_INCREMENT = 1;`);

    await queryRunner.query(`DELETE FROM orders;`);
    await queryRunner.query(`ALTER TABLE orders AUTO_INCREMENT = 1;`);

    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    console.log('Orders cleared');

    const customers = await customersService.findAll();
    const products = await productsService.findAll();

    if (products.length === 0 || customers.length === 0) {
      console.log('No products or customers → cannot seed orders');
      return;
    }

    console.log('Seeding 5 orders per customer...');

    for (const customer of customers) {
      for (let i = 0; i < 5; i++) {
        const product = products[Math.floor(Math.random() * products.length)];

        await ordersService.create({
          customerId: customer.id,
          date: new Date().toISOString(),
          items: [
            {
              productId: product.id,
              quantity: Math.floor(Math.random() * 5) + 1,
              categoryId: product.categoryId ?? undefined,
            },
          ],
        });
      }
    }

    console.log('Orders seeded successfully');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seed done');
    process.exit(0);
  });
}
