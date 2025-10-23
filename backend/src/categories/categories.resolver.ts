import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [Category], { name: 'categories' })
  async getCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  async getCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category, { name: 'createCategory' })
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoriesService.create(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category, { name: 'updateCategory' })
  async updateCategory(
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoriesService.update(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteCategory' })
  async deleteCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.categoriesService.delete(id);
  }
}
