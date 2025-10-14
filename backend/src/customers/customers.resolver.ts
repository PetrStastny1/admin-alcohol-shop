import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { BadRequestException } from '@nestjs/common';

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

  // ✅ Vytvoření nového zákazníka (kontrola duplicit e-mailu)
  @Mutation(() => Customer, { name: 'createCustomer' })
  async createCustomer(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('phone', { nullable: true }) phone?: string,
  ): Promise<Customer> {
    const existing = await this.customersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException(`Zákazník s e-mailem ${email} již existuje`);
    }

    return this.customersService.create(name, email, phone);
  }

  // ✅ Aktualizace zákazníka (kontrola duplicit e-mailu)
  @Mutation(() => Customer, { name: 'updateCustomer' })
  async updateCustomer(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('phone', { nullable: true }) phone?: string,
  ): Promise<Customer> {
    if (email) {
      const existing = await this.customersService.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Zákazník s e-mailem ${email} již existuje`);
      }
    }

    return this.customersService.update(id, name, email, phone);
  }

  // ✅ Smazání zákazníka
  @Mutation(() => Boolean, { name: 'deleteCustomer' })
  deleteCustomer(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.customersService.delete(id);
  }
}
