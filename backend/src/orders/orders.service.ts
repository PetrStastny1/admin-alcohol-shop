import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Category } from '../categories/category.entity';
import { Product } from '../products/products.entity';
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
  ) {}

  async onModuleInit() {
    const products = await this.productRepository.find();
    if (products.length === 0) {
      console.log('⚠️ Žádné produkty – seed objednávek přeskočen');
      return;
    }

    const existing = await this.orderRepository.count();
    if (existing > 0) {
      console.log('ℹ️ Orders už existují – seed přeskočen');
      return;
    }

    const sampleOrders = [
      { customer: 'Jan Novák', product: products[0], quantity: 2 },
      { customer: 'Petr Svoboda', product: products[1] ?? products[0], quantity: 1 },
      { customer: 'Lucie Malá', product: products[2] ?? products[0], quantity: 3 },
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

    console.log('✅ Orders seeded');
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['category', 'product'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['category', 'product'],
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

    const product = await this.productRepository.findOne({ where: { id: input.productId }, relations: ['category'] });
    if (!product) {
      throw new NotFoundException(`Produkt s ID ${input.productId} nenalezen`);
    }

    let category: Category | null = null;
    if (input.categoryId) {
      category = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
    }

    const totalPrice = Number(product.price) * input.quantity;

    const order = this.orderRepository.create({
      customer: input.customer,
      product,
      category: category ?? product.category ?? undefined,
      quantity: input.quantity,
      date: input.date,
      totalPrice,
    });

    return await this.orderRepository.save(order);
  }

  async update(id: number, input: UpdateOrderInput): Promise<Order> {
    const order = await this.findOne(id);

    if (input.customer) {
      order.customer = input.customer;
    }

    if (input.productId) {
      const product = await this.productRepository.findOne({ where: { id: input.productId }, relations: ['category'] });
      if (!product) throw new NotFoundException(`Produkt s ID ${input.productId} nenalezen`);
      order.product = product;
      if (!input.categoryId) {
        order.category = product.category;
      }
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
      if (!category) throw new NotFoundException(`Kategorie s ID ${input.categoryId} nenalezena`);
      order.category = category;
    }

    if (input.quantity !== undefined) {
      if (input.quantity <= 0) throw new BadRequestException(`Množství musí být větší než 0`);
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
