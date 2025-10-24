import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [Product], { name: 'products' })
  async getProducts(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Query(() => Product, { name: 'product' })
  async getProduct(@Args('id', { type: () => Int }) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Query(() => [Product], { name: 'productsByCategory' })
  async getProductsByCategory(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ): Promise<Product[]> {
    return this.productsService.findByCategory(categoryId);
  }

  @Mutation(() => Product, { name: 'createProduct' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async createProduct(@Args('input') input: CreateProductInput): Promise<Product> {
    return this.productsService.create({
      name: input.name,
      price: input.price,
      description: input.description,
      stock: input.stock ?? 0,
      isActive: input.isActive ?? true,
      categoryId: input.categoryId,
    });
  }

  @Mutation(() => Product, { name: 'updateProduct' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productsService.update(id, {
      name: input.name,
      price: input.price,
      description: input.description,
      stock: input.stock,
      isActive: input.isActive,
      categoryId: input.categoryId,
    });
  }

  @Mutation(() => Boolean, { name: 'deleteProduct' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteProduct(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.productsService.delete(id);
  }
}
