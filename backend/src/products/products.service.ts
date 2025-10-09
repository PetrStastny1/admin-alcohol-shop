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

  // Metoda pro získání všech produktů
  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // Metoda pro vytvoření produktu
  create(product: Product): Promise<Product> {
    return this.productRepository.save(product);
  }

  // Metoda pro získání jednoho produktu podle ID
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }
}
