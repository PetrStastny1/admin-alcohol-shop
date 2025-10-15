import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CustomerInput } from './dto/customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  // ✅ Všechny zákazníky
  @Query(() => [Customer], { name: 'customers' })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  // ✅ Jeden zákazník podle ID
  @Query(() => Customer, { name: 'customer' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  // ✅ Vytvoření zákazníka
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Customer, { name: 'createCustomer' })
  async createCustomer(@Args('input') input: CustomerInput): Promise<Customer> {
    const existing = await this.customersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem ${input.email} již existuje`);
    }
    return this.customersService.create(input.name, input.email, input.phone);
  }

  // ✅ Aktualizace zákazníka (povinný jen ID, ostatní volitelné)
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Customer, { name: 'updateCustomer' })
  async updateCustomer(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<Customer> {
    if (input.email) {
      const existing = await this.customersService.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Zákazník s e-mailem ${input.email} již existuje`);
      }
    }
    return this.customersService.update(id, input.name, input.email, input.phone);
  }

  // ✅ Smazání zákazníka
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteCustomer' })
  deleteCustomer(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.customersService.delete(id);
  }
}
