import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => [Customer], { name: 'customers' })
  async getCustomers(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Query(() => Customer, { name: 'customer' })
  async getCustomer(@Args('id', { type: () => Int }) id: number): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Customer, { name: 'createCustomer' })
  async createCustomer(@Args('input') input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.customersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem "${input.email}" již existuje`);
    }
    return this.customersService.create(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Customer, { name: 'updateCustomer' })
  async updateCustomer(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<Customer> {
    return this.customersService.update(id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteCustomer' })
  async deleteCustomer(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.customersService.delete(id);
  }
}
