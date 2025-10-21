import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Injectable()
export class CustomersService implements OnModuleInit {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async onModuleInit() {
    const defaultCustomers: CreateCustomerInput[] = [
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '123456789', address: 'Praha' },
      { name: 'Bob Smith', email: 'bob@example.com', phone: '987654321', address: 'Brno' },
      { name: 'Charlie Brown', email: 'charlie@example.com', phone: '777888999', address: 'Ostrava' },
      { name: 'Diana Prince', email: 'diana@example.com', phone: '111222333', address: 'Plzeň' },
      { name: 'Ethan Hunt', email: 'ethan@example.com', phone: '222333444', address: 'Liberec' },
      { name: 'Fiona White', email: 'fiona@example.com', phone: '444555666', address: 'Olomouc' },
      { name: 'George Black', email: 'george@example.com', phone: '999000111', address: 'České Budějovice' },
      { name: 'Hannah Green', email: 'hannah@example.com', phone: '666777888', address: 'Hradec Králové' },
      { name: 'Ivan Red', email: 'ivan@example.com', phone: '321654987', address: 'Zlín' },
      { name: 'Julia Blue', email: 'julia@example.com', phone: '741852963', address: 'Pardubice' },
    ];

    for (const c of defaultCustomers) {
      const existing = await this.findByEmail(c.email);
      if (!existing) {
        await this.create(c);
      }
    }

    console.log('✅ Customers soft-seeded (10 položek)');
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
