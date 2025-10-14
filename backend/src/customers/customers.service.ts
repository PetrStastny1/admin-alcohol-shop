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

  // ✅ Automatické naplnění při startu
  async onModuleInit() {
    const count = await this.customerRepository.count();
    if (count === 0) {
      await this.createSafe('Alice Johnson', 'alice@example.com', '123456789');
      await this.createSafe('Bob Smith', 'bob@example.com');
      await this.createSafe('Charlie Brown', 'charlie@example.com', '987654321');
      console.log('✅ Customers initialized');
    }
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ relations: ['orders'] });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  // ✅ Najít zákazníka podle e-mailu
  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { email } });
  }

  // ✅ Vytvoření zákazníka (bez duplicit)
  async createSafe(name: string, email: string, phone?: string): Promise<Customer> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    const customer = this.customerRepository.create({ name, email, phone });
    return this.customerRepository.save(customer);
  }

  async create(name: string, email: string, phone?: string): Promise<Customer> {
    return this.createSafe(name, email, phone);
  }

  // ✅ Aktualizace zákazníka s kontrolou duplicit e-mailu
  async update(
    id: number,
    name?: string,
    email?: string,
    phone?: string,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    if (email) {
      const existing = await this.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Zákazník s e-mailem ${email} již existuje`);
      }
      customer.email = email;
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;

    return this.customerRepository.save(customer);
  }

  // ✅ Smazání zákazníka
  async delete(id: number): Promise<boolean> {
    const result = await this.customerRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return true;
  }
}
