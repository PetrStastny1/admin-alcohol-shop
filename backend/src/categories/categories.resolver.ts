import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [Category], { name: 'categories' })
  @UseGuards(GqlAuthGuard)
  async getCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  @UseGuards(GqlAuthGuard)
  async getCategory(@Args('id', { type: () => Int }) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => Category, { name: 'createCategory' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async createCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return this.categoriesService.create(input);
  }

  @Mutation(() => Category, { name: 'updateCategory' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCategory(@Args('input') input: UpdateCategoryInput): Promise<Category> {
    return this.categoriesService.update(input);
  }

  @Mutation(() => Boolean, { name: 'deleteCategory' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteCategory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.categoriesService.delete(id);
  }
}
