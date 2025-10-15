import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { OrderInput } from './dto/order.input';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Všechny objednávky (veřejné)
  @Query(() => [Order], { name: 'orders' })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  // ✅ Jedna objednávka (veřejné)
  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  // ✅ Vytvoření objednávky – jen admin
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order, { name: 'createOrder' })
  createOrder(@Args('input') input: OrderInput): Promise<Order> {
    return this.ordersService.create({
      customer: { id: input.customerId },
      product: { id: input.productId },
      quantity: input.quantity,
    });
  }

  // ✅ Aktualizace objednávky – jen admin
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order, { name: 'updateOrder' })
  updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: OrderInput,
  ): Promise<Order> {
    return this.ordersService.update(id, {
      customer: input.customerId ? { id: input.customerId } : undefined,
      product: input.productId ? { id: input.productId } : undefined,
      quantity: input.quantity,
    });
  }

  // ✅ Smazání objednávky – jen admin
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteOrder' })
  async deleteOrder(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.ordersService.delete(id);
  }
}
