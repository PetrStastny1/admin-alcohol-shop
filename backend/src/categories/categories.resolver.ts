import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';
import { CategoryInput } from './dto/category.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- Queries ---
  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => Int }) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  // --- Mutations (jen pro přihlášeného admina) ---
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category)
  async createCategory(@Args('input') input: CategoryInput): Promise<Category> {
    return this.categoriesService.create(input.name, input.description);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category)
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: CategoryInput,
  ): Promise<Category> {
    return this.categoriesService.update(id, input.name, input.description);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteCategory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.categoriesService.delete(id);
  }
}
