import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ Všechny aktivní produkty
  @Query(() => [Product], { name: 'products' })
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // ✅ Jeden produkt podle ID
  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // ✅ Vytvoření produktu (jen admin)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Product, { name: 'createProduct' })
  async createProduct(
    @Args('name') name: string,
    @Args('price', { type: () => Float }) price: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { type: () => Int, nullable: true }) categoryId?: number,
  ): Promise<Product> {
    return this.productsService.create({
      name,
      price,
      description,
      category: categoryId ? { id: categoryId } as any : undefined,
    });
  }

  // ✅ Aktualizace produktu (jen admin)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Product, { name: 'updateProduct' })
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('price', { type: () => Float, nullable: true }) price?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { type: () => Int, nullable: true }) categoryId?: number,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<Product> {
    return this.productsService.update(id, {
      name,
      price,
      description,
      isActive,
      category: categoryId ? { id: categoryId } as any : undefined,
    });
  }

  // ✅ Soft delete – produkt se označí jako neaktivní (jen admin)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Product, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => Int }) id: number): Promise<Product> {
    return this.productsService.delete(id);
  }
}
