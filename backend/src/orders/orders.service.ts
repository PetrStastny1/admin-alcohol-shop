import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/products.entity';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    const customers = await this.customerRepository.find();
    const products = await this.productRepository.find();

    if (customers.length === 0 || products.length === 0) {
      console.log('⚠️ Orders seed skipped: no customers or products found');
      return;
    }

    const seedOrders = [
      { customer: customers[0], product: products[0], quantity: 2 },
      { customer: customers[1] ?? customers[0], product: products[1] ?? products[0], quantity: 1 },
      { customer: customers[2] ?? customers[0], product: products[2] ?? products[0], quantity: 3 },
    ];

    for (const o of seedOrders) {
      const existing = await this.orderRepository.findOne({
        where: { customer: { id: o.customer.id }, product: { id: o.product.id } },
        relations: ['customer', 'product'],
      });

      if (!existing) {
        await this.create({ customer: { id: o.customer.id }, product: { id: o.product.id }, quantity: o.quantity });
      }
    }

    console.log('✅ Orders soft-seeded');
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['customer', 'product'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });
    if (!order) {
      throw new NotFoundException(`Objednávka s ID ${id} nenalezena`);
    }
    return order;
  }

  async create(data: { customer: { id: number }; product: { id: number }; quantity: number }): Promise<Order> {
    const customer = await this.customerRepository.findOne({ where: { id: data.customer.id } });
    if (!customer) {
      throw new NotFoundException(`Zákazník s ID ${data.customer.id} nenalezen`);
    }

    const product = await this.productRepository.findOne({ where: { id: data.product.id } });
    if (!product) {
      throw new NotFoundException(`Produkt s ID ${data.product.id} nenalezen`);
    }

    const existingOrder = await this.orderRepository.findOne({
      where: { customer: { id: data.customer.id }, product: { id: data.product.id } },
      relations: ['customer', 'product'],
    });
    if (existingOrder) {
      throw new BadRequestException(
        `Objednávka zákazníka ${data.customer.id} na produkt ${data.product.id} už existuje`,
      );
    }

    const total = Number(product.price) * data.quantity;
    const order = this.orderRepository.create({ customer, product, quantity: data.quantity, total });
    return this.orderRepository.save(order);
  }

  async update(
    id: number,
    updateData: { customer?: { id: number }; product?: { id: number }; quantity?: number },
  ): Promise<Order> {
    const order = await this.findOne(id);

    if (updateData.customer?.id) {
      const customer = await this.customerRepository.findOne({ where: { id: updateData.customer.id } });
      if (!customer) throw new NotFoundException(`Zákazník s ID ${updateData.customer.id} nenalezen`);
      order.customer = customer;
    }

    if (updateData.product?.id) {
      const product = await this.productRepository.findOne({ where: { id: updateData.product.id } });
      if (!product) throw new NotFoundException(`Produkt s ID ${updateData.product.id} nenalezen`);
      order.product = product;
    }

    if (updateData.quantity !== undefined) {
      order.quantity = updateData.quantity;
    }

    order.total = Number(order.product.price) * order.quantity;

    return this.orderRepository.save(order);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Objednávka s ID ${id} nenalezena`);
    }
    return true;
  }
}
