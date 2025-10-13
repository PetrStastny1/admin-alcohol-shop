import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Získání všech produktů
  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // Vytvoření produktu
  async create(productData: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(productData);
    return this.productRepository.save(newProduct);
  }

  // Získání jednoho produktu podle ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // Aktualizace produktu podle ID
  async update(id: number, updateData: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id); // ověří existenci
    Object.assign(product, updateData);
    return this.productRepository.save(product);
  }

  // Smazání produktu podle ID
  async delete(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
