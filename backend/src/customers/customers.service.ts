import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService implements OnModuleInit {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async onModuleInit() {
    const defaultCustomers = [
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '123456789' },
      { name: 'Bob Smith', email: 'bob@example.com' },
      { name: 'Charlie Brown', email: 'charlie@example.com', phone: '987654321' },
    ];

    for (const c of defaultCustomers) {
      const existing = await this.findByEmail(c.email);
      if (!existing) {
        await this.create(c.name, c.email, c.phone);
      }
    }

    console.log('✅ Customers soft-seeded');
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

  async create(name: string, email: string, phone?: string): Promise<Customer> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem "${email}" již existuje`);
    }
    const customer = this.customerRepository.create({ name, email, phone });
    return this.customerRepository.save(customer);
  }

  async update(id: number, name?: string, email?: string, phone?: string): Promise<Customer> {
    const customer = await this.findOne(id);

    if (email && email !== customer.email) {
      const existing = await this.findByEmail(email);
      if (existing) {
        throw new BadRequestException(`Zákazník s e-mailem "${email}" již existuje`);
      }
      customer.email = email;
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;

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
