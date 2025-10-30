import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
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
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
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

    let dayOffset = 0;
    for (const o of sampleOrders) {
      const item = this.orderItemRepository.create({
        product: o.product,
        category: o.product.category,
        quantity: o.quantity,
        price: Number(o.product.price),
      });

      const order = this.orderRepository.create({
        customer: o.customer,
        items: [item],
        date: new Date(Date.now() - dayOffset * 86400000),
      });

      await this.orderRepository.save(order);
      dayOffset++;
    }

    console.log('✅ Orders seeded (10 položek)');
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items', 'items.product', 'items.category', 'customer'] });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.category', 'customer'],
    });
    if (!order) {
      throw new NotFoundException(`Objednávka s ID ${id} nenalezena`);
    }
    return order;
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException(`Zákazník s ID ${customerId} nenalezen`);
    }

    return this.orderRepository.find({
      where: { customer: { id: customerId } },
      relations: ['items', 'items.product', 'items.category', 'customer'],
    });
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const customer = await this.customerRepository.findOne({ where: { id: input.customerId } });
    if (!customer) {
      throw new NotFoundException(`Zákazník s ID ${input.customerId} nenalezen`);
    }

    if (!input.items || input.items.length === 0) {
      throw new BadRequestException(`Objednávka musí obsahovat alespoň jednu položku`);
    }

    const items: OrderItem[] = [];
    for (const i of input.items) {
      const product = await this.productRepository.findOne({
        where: { id: i.productId },
        relations: ['category'],
      });
      if (!product) {
        throw new NotFoundException(`Produkt s ID ${i.productId} nenalezen`);
      }
      if (i.quantity <= 0) {
        throw new BadRequestException(`Množství musí být větší než 0`);
      }

      let category: Category | null = null;
      if (i.categoryId) {
        category = await this.categoryRepository.findOne({ where: { id: i.categoryId } });
        if (!category) {
          throw new NotFoundException(`Kategorie s ID ${i.categoryId} nenalezena`);
        }
      }

      const item = this.orderItemRepository.create({
        product,
        category: category ?? product.category,
        quantity: i.quantity,
        price: Number(product.price),
      });
      items.push(item);
    }

    const order = this.orderRepository.create({
      customer,
      items,
      date: input.date ? new Date(input.date) : new Date(),
    });

    return this.orderRepository.save(order);
  }

  async update(id: number, input: UpdateOrderInput): Promise<Order> {
    const order = await this.findOne(id);

    if (input.customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: input.customerId } });
      if (!customer) {
        throw new NotFoundException(`Zákazník s ID ${input.customerId} nenalezen`);
      }
      order.customer = customer;
    }

    if (input.items) {
      const newItems: OrderItem[] = [];
      for (const i of input.items) {
        const product = await this.productRepository.findOne({
          where: { id: i.productId },
          relations: ['category'],
        });
        if (!product) {
          throw new NotFoundException(`Produkt s ID ${i.productId} nenalezen`);
        }
        if (i.quantity <= 0) {
          throw new BadRequestException(`Množství musí být větší než 0`);
        }

        let category: Category | null = null;
        if (i.categoryId) {
          category = await this.categoryRepository.findOne({ where: { id: i.categoryId } });
          if (!category) {
            throw new NotFoundException(`Kategorie s ID ${i.categoryId} nenalezena`);
          }
        }

        const item = this.orderItemRepository.create({
          product,
          category: category ?? product.category,
          quantity: i.quantity,
          price: Number(product.price),
        });
        newItems.push(item);
      }
      order.items = newItems;
    }

    if (input.date) {
      order.date = new Date(input.date);
    }

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
