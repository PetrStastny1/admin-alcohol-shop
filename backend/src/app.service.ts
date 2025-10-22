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

      // ---- ✅ Seed users ----
      const defaultUsers = [
        {
          email: 'admin@example.com',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
        },
        {
          email: 'user1@example.com',
          username: 'user1',
          password: 'password1',
          role: 'user',
        },
        {
          email: 'user2@example.com',
          username: 'user2',
          password: 'password2',
          role: 'user',
        },
        {
          email: 'user3@example.com',
          username: 'user3',
          password: 'password3',
          role: 'user',
        },
        {
          email: 'user4@example.com',
          username: 'user4',
          password: 'password4',
          role: 'user',
        },
        {
          email: 'user5@example.com',
          username: 'user5',
          password: 'password5',
          role: 'user',
        },
        {
          email: 'user6@example.com',
          username: 'user6',
          password: 'password6',
          role: 'user',
        },
        {
          email: 'user7@example.com',
          username: 'user7',
          password: 'password7',
          role: 'user',
        },
        {
          email: 'user8@example.com',
          username: 'user8',
          password: 'password8',
          role: 'user',
        },
        {
          email: 'user9@example.com',
          username: 'user9',
          password: 'password9',
          role: 'user',
        },
      ];

      for (const u of defaultUsers) {
        const existing = await this.usersService.findOneByEmail(u.email);
        if (!existing) {
          await this.usersService.create(u);
        }
      }

      console.log('✅ Users seeded (admin + 9 users)');
      console.log('✅ DB seeded');
    } finally {
      await queryRunner.release();
    }
  }

  getHello(): string {
    return 'Backend is running with auto-seed!';
  }
}
