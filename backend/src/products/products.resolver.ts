import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ Získání všech produktů
  @Query(() => [Product], { name: 'products' })
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // ✅ Získání jednoho produktu podle ID
  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // ✅ Vytvoření nového produktu (kontrola duplicit)
  @Mutation(() => Product, { name: 'createProduct' })
  async createProduct(
    @Args('name') name: string,
    @Args('price') price: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { nullable: true }) categoryId?: number,
  ): Promise<Product> {
    const existing = await this.productsService.findByNameAndCategory(name, categoryId);
    if (existing) return existing;

    return this.productsService.create({ name, price, description, categoryId });
  }

  // ✅ Aktualizace produktu (bez duplicit)
  @Mutation(() => Product, { name: 'updateProduct' })
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('price', { nullable: true }) price?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { nullable: true }) categoryId?: number,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<Product> {
    const product = await this.productsService.findOne(id);
    const updateData: Partial<Product> = {};

    // Kontrola duplicitního názvu a kategorie
    if (name !== undefined || categoryId !== undefined) {
      const existing = await this.productsService.findByNameAndCategory(
        name ?? product.name,
        categoryId ?? product.categoryId,
      );
      if (existing && existing.id !== id) {
        throw new Error('Produkt s tímto názvem a kategorií již existuje');
      }
    }

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = isActive;

    return this.productsService.update(id, updateData);
  }

  // ✅ Smazání produktu podle ID
  @Mutation(() => Boolean, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.productsService.delete(id);
  }
}
