import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
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

  // AUTOMATICKÉ NAPLNĚNÍ PŘI STARTU
  async onModuleInit() {
    const count = await this.orderRepository.count();
    if (count === 0) {
      const customer = await this.customerRepository.findOne({ where: {} });
      const product = await this.productRepository.findOne({ where: {} });

      if (customer && product) {
        await this.create(customer.id, product.id, 1);
        console.log('✅ Orders initialized');
      } else {
        console.log('⚠️ Orders seed skipped: no customer or product found');
      }
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['customer', 'product'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  // Vytvoření objednávky s kontrolou duplicit
  async create(customerId: number, productId: number, quantity: number): Promise<Order> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
    if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

    const existingOrder = await this.orderRepository.findOne({
      where: { customer: { id: customerId }, product: { id: productId } },
      relations: ['customer', 'product'],
    });
    if (existingOrder) return existingOrder;

    const total = Number(product.price) * quantity;
    const order = this.orderRepository.create({ customer, product, quantity, total });
    return this.orderRepository.save(order);
  }

  async update(
    id: number,
    customerId?: number,
    productId?: number,
    quantity?: number,
  ): Promise<Order> {
    const order = await this.findOne(id);

    if (customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
      order.customer = customer;
    }

    if (productId) {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);
      order.product = product;
    }

    if (quantity !== undefined) {
      order.quantity = quantity;
    }

    order.total = Number(order.product.price) * order.quantity;

    return this.orderRepository.save(order);
  }

  // Bezpečné mazání objednávky
  async delete(id: number): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return true;
  }
}
