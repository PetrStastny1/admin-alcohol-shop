import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      relations: ['category', 'orders'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'orders'],
    });
    if (!product) throw new NotFoundException(`Produkt s ID ${id} nenalezen`);
    return product;
  }

  async findByNameAndCategory(name: string, categoryId?: number): Promise<Product | null> {
    if (categoryId) {
      return this.productRepository.findOne({
        where: { name, category: { id: categoryId } },
        relations: ['category'],
      });
    }
    return this.productRepository.findOne({
      where: { name },
      relations: ['category'],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const categoryId = productData.category?.id;

    const existing = await this.findByNameAndCategory(productData.name!, categoryId);
    if (existing) {
      throw new BadRequestException(
        `Produkt "${productData.name}" v této kategorii již existuje`,
      );
    }

    let category = undefined;
    if (categoryId) {
      category = await this.categoriesService.findOne(categoryId);
      if (!category) {
        throw new NotFoundException(`Kategorie s ID ${categoryId} nenalezena`);
      }
    }

    const newProduct = this.productRepository.create({
      name: productData.name,
      price: productData.price,
      description: productData.description,
      isActive: productData.isActive ?? true,
      category,
    });

    return this.productRepository.save(newProduct);
  }

  async update(id: number, updateData: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);

    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.isActive !== undefined) product.isActive = updateData.isActive;

    if (updateData.category?.id !== undefined) {
      const category = await this.categoriesService.findOne(updateData.category.id);
      if (!category) {
        throw new NotFoundException(`Kategorie s ID ${updateData.category.id} nenalezena`);
      }
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async delete(id: number): Promise<Product> {
    const product = await this.findOne(id);
    if (!product.isActive) return product;
    product.isActive = false;
    return this.productRepository.save(product);
  }

  async onModuleInit() {
    const categories = await this.categoriesService.findAll();
    if (!categories.length) {
      console.log('⚠️ Products seed skipped: no categories found');
      return;
    }

    const whisky = categories.find((c) => c.name === 'Whisky');
    const vino = categories.find((c) => c.name === 'Víno');
    const pivo = categories.find((c) => c.name === 'Pivo');
    const likery = categories.find((c) => c.name === 'Likéry');

    const items = [
      { name: 'Jameson', price: 450, category: whisky },
      { name: 'Glenfiddich 12', price: 1200, category: whisky },
      { name: 'Chardonnay', price: 250, category: vino },
      { name: 'Merlot', price: 300, category: vino },
      { name: 'Pilsner Urquell', price: 30, category: pivo },
      { name: 'Corona', price: 35, category: pivo },
      { name: 'Baileys', price: 400, category: likery },
      { name: 'Jägermeister', price: 380, category: likery },
    ];

    for (const item of items) {
      const exists = await this.findByNameAndCategory(item.name, item.category?.id);
      if (exists) {
        if (!exists.isActive) {
          exists.isActive = true;
          await this.productRepository.save(exists);
        }
      } else {
        await this.create({
          name: item.name,
          price: item.price,
          category: item.category,
        });
      }
    }

    console.log('✅ Products soft-seeded');
  }
}
