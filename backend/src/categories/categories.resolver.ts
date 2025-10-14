import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- Queries ---
  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { nullable: true })
  async category(@Args('id', { type: () => Int }) id: number): Promise<Category | null> {
    return this.categoriesService.findOne(id);
  }

  // --- Mutations ---
  @Mutation(() => Category)
  async createCategory(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<Category> {
    return this.categoriesService.create(name, description);
  }

  @Mutation(() => Category)
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<Category> {
    return this.categoriesService.update(id, name, description);
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.categoriesService.delete(id);
  }
}
