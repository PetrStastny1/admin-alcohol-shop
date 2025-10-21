import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/products.entity';
import { Customer } from '../customers/customer.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async onModuleInit() {
    const products = await this.productRepository.find({ relations: ['category'] });
    const customers = await this.customerRepository.find();

    if (!products.length || !customers.length) {
      console.log('⚠️ Žádné produkty nebo zákazníci – seed objednávek přeskočen');
      return;
    }

    const existing = await this.orderRepository.count();
    if (existing > 0) {
      console.log('ℹ️ Orders už existují – seed přeskočen');
      return;
    }

    const sampleOrders = [
      { customer: customers[0], product: products[0], quantity: 2 },
      { customer: customers[1], product: products[1], quantity: 1 },
      { customer: customers[2], product: products[2], quantity: 3 },
      { customer: customers[3], product: products[3], quantity: 5 },
      { customer: customers[4], product: products[4], quantity: 2 },
      { customer: customers[5], product: products[5], quantity: 4 },
      { customer: customers[6], product: products[6], quantity: 1 },
      { customer: customers[7], product: products[7], quantity: 2 },
      { customer: customers[8], product: products[8], quantity: 6 },
      { customer: customers[9], product: products[9], quantity: 3 },
    ];

    for (const o of sampleOrders) {
      const totalPrice = Number(o.product.price) * o.quantity;
      const order = this.orderRepository.create({
        customer: o.customer,
        product: o.product,
        category: o.product.category,
        quantity: o.quantity,
        date: new Date().toISOString(),
        totalPrice,
      });
      await this.orderRepository.save(order);
    }

    console.log('✅ Orders seeded (10 položek)');
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['category', 'product', 'customer'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['category', 'product', 'customer'],
    });
    if (!order) {
      throw new NotFoundException(`Objednávka s ID ${id} nenalezena`);
    }
    return order;
  }

  async create(input: CreateOrderInput): Promise<Order> {
    if (input.quantity <= 0) {
      throw new BadRequestException(`Množství musí být větší než 0`);
    }

    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Produkt s ID ${input.productId} nenalezen`);
    }

    const customer = await this.customerRepository.findOne({
      where: { id: input.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Zákazník s ID ${input.customerId} nenalezen`);
    }

    let category: Category | null = null;
    if (input.categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Kategorie s ID ${input.categoryId} nenalezena`);
      }
    }

    const totalPrice = Number(product.price) * input.quantity;

    const order = this.orderRepository.create({
      customer,
      product,
      category: category ?? product.category,
      quantity: input.quantity,
      date: input.date ?? new Date().toISOString(),
      totalPrice,
    });

    return await this.orderRepository.save(order);
  }

  async update(id: number, input: UpdateOrderInput): Promise<Order> {
    const order = await this.findOne(id);

    if (input.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: input.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Zákazník s ID ${input.customerId} nenalezen`);
      }
      order.customer = customer;
    }

    if (input.productId) {
      const product = await this.productRepository.findOne({
        where: { id: input.productId },
        relations: ['category'],
      });
      if (!product) {
        throw new NotFoundException(`Produkt s ID ${input.productId} nenalezen`);
      }
      order.product = product;
      if (!input.categoryId) {
        order.category = product.category;
      }
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Kategorie s ID ${input.categoryId} nenalezena`);
      }
      order.category = category;
    }

    if (input.quantity !== undefined) {
      if (input.quantity <= 0) {
        throw new BadRequestException(`Množství musí být větší než 0`);
      }
      order.quantity = input.quantity;
    }

    if (input.date) {
      order.date = input.date;
    }

    order.totalPrice = Number(order.product.price) * order.quantity;

    return await this.orderRepository.save(order);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.orderRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Objednávka s ID ${id} nenalezena`);
    }
    return true;
  }
}
