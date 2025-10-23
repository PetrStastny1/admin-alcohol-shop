import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => [Customer], { name: 'customers' })
  @UseGuards(GqlAuthGuard)
  async getCustomers(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Query(() => Customer, { name: 'customer' })
  @UseGuards(GqlAuthGuard)
  async getCustomer(@Args('id', { type: () => Int }) id: number): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Mutation(() => Customer, { name: 'createCustomer' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async createCustomer(@Args('input') input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.customersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem "${input.email}" již existuje`);
    }
    return this.customersService.create(input);
  }

  @Mutation(() => Customer, { name: 'updateCustomer' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCustomer(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<Customer> {
    return this.customersService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteCustomer' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteCustomer(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.customersService.delete(id);
  }
}