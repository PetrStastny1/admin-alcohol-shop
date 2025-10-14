import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
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

  // ✅ Získání všech produktů
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category', 'orders'] });
  }

  // ✅ Získání jednoho produktu podle ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ 
      where: { id },
      relations: ['category', 'orders'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // ✅ Kontrola duplicit podle name + categoryId
  async findByNameAndCategory(name: string, categoryId?: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { 
        name, 
        category: categoryId ? { id: categoryId } : undefined 
      },
      relations: ['category'],
    });
  }

  // ✅ Vytvoření produktu (kontrola duplicit)
  async create(productData: Partial<Product>): Promise<Product> {
    const existing = await this.findByNameAndCategory(productData.name!, productData.categoryId);
    if (existing) return existing;

    const newProduct = this.productRepository.create(productData);
    return this.productRepository.save(newProduct);
  }

  // ✅ Aktualizace produktu podle ID (bez přepsání undefined)
  async update(id: number, updateData: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);

    if (updateData.name !== undefined) product.name = updateData.name;
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.description !== undefined) product.description = updateData.description;
    if (updateData.categoryId !== undefined) product.categoryId = updateData.categoryId;
    if (updateData.isActive !== undefined) product.isActive = updateData.isActive;

    return this.productRepository.save(product);
  }

  // ✅ Smazání produktu podle ID
  async delete(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return true;
  }

  // ✅ AUTOMATICKÉ NAPLNĚNÍ PŘI STARTU (seed) – kontrola duplicit
  async onModuleInit() {
    const count = await this.productRepository.count();
    if (count === 0) {
      const categories = await this.categoriesService.findAll();

      const whisky = categories.find(c => c.name === 'Whisky');
      const vino = categories.find(c => c.name === 'Víno');
      const pivo = categories.find(c => c.name === 'Pivo');
      const likery = categories.find(c => c.name === 'Likéry');

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
        if (!exists) {
          await this.create(item);
        }
      }

      console.log('✅ Products initialized');
    }
  }
}
