import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './products.entity';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // Všechny produkty
  @Query(() => [Product], { name: 'getAllProducts' })
  findAll() {
    return this.productsService.findAll();
  }

  // Jeden produkt podle ID
  @Query(() => Product, { name: 'getProductById' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.productsService.findOne(id);
  }

  // Vytvoření produktu
  @Mutation(() => Product, { name: 'createProduct' })
  createProduct(
    @Args('name') name: string,
    @Args('price') price: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { nullable: true }) categoryId?: number,
  ) {
    return this.productsService.create({ name, price, description, categoryId });
  }

  // 🧩 Nová mutace — aktualizace produktu
  @Mutation(() => Product, { name: 'updateProduct' })
  updateProduct(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('price', { nullable: true }) price?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('categoryId', { nullable: true }) categoryId?: number,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ) {
    return this.productsService.update(id, { name, price, description, categoryId, isActive });
  }

  // Smazání produktu
  @Mutation(() => Boolean, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.productsService.delete(id);
  }
}
