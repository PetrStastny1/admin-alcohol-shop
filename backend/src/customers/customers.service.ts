import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { Order } from '../orders/order.entity';
import { Product } from '../products/products.entity';

@Injectable()
export class CustomersService implements OnModuleInit {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    const defaultCustomers: CreateCustomerInput[] = [
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '123456789', address: 'Praha' },
      { name: 'Bob Smith', email: 'bob@example.com', phone: '987654321', address: 'Brno' },
      { name: 'Charlie Brown', email: 'charlie@example.com', phone: '777888999', address: 'Ostrava' },
    ];

    for (const c of defaultCustomers) {
      let customer = await this.findByEmail(c.email);
      if (!customer) {
        customer = await this.create(c);
      }

      const products = await this.productRepository.find({ take: 3 });
      if (products.length) {
        for (let i = 0; i < 2; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const order = this.orderRepository.create({
            customer,
            product,
            category: product.category,
            quantity: 1 + Math.floor(Math.random() * 3),
            totalPrice: product.price,
            date: new Date().toISOString(),
          });
          await this.orderRepository.save(order);
        }
      }
    }

    console.log('✅ Customers + orders soft-seeded');
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ relations: ['orders'] });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!customer) {
      throw new NotFoundException(`Zákazník s ID ${id} nenalezen`);
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { email } });
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem "${input.email}" již existuje`);
    }
    const customer = this.customerRepository.create(input);
    return this.customerRepository.save(customer);
  }

  async update(id: number, input: UpdateCustomerInput): Promise<Customer> {
    const customer = await this.findOne(id);

    if (input.email && input.email !== customer.email) {
      const existing = await this.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Zákazník s e-mailem "${input.email}" již existuje`);
      }
      customer.email = input.email;
    }

    if (input.name) customer.name = input.name;
    if (input.phone) customer.phone = input.phone;
    if (input.address) customer.address = input.address;

    return this.customerRepository.save(customer);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.customerRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Zákazník s ID ${id} nenalezen`);
    }
    return true;
  }
}
