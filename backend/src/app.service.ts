import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';
import { CustomersService } from './customers/customers.service';
import { OrdersService } from './orders/orders.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') {
      console.log('⏭️ DB seed přeskočen (NODE_ENV !== development)');
      return;
    }

    console.log('🔄 Reset DB (development seed)...');

    const queryRunner = this.dataSource.createQueryRunner();
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

      await this.categoriesService.onModuleInit();
      await this.productsService.onModuleInit();
      await this.customersService.onModuleInit();
      await this.ordersService.onModuleInit();

      const existingAdmin = await this.usersService.findOneByEmail('admin@example.com');
      if (!existingAdmin) {
        await this.usersService.create({
          email: 'admin@example.com',
          password: 'admin123',
          username: 'admin',
          role: 'admin',
        });
        console.log('👤 Admin uživatel vytvořen');
      }

      console.log('✅ DB seeded');
    } finally {
      await queryRunner.release();
    }
  }

  getHello(): string {
    return 'Backend is running with auto-seed!';
  }
}
