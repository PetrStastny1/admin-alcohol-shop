import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  // ✅ Získání všech objednávek
  @Query(() => [Order], { name: 'orders' })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  // ✅ Získání jedné objednávky podle ID
  @Query(() => Order, { name: 'order' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  // ✅ Vytvoření nové objednávky (bez duplicit)
  @Mutation(() => Order, { name: 'createOrder' })
  createOrder(
    @Args('customerId', { type: () => Int }) customerId: number,
    @Args('productId', { type: () => Int }) productId: number,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<Order> {
    return this.ordersService.create(customerId, productId, quantity);
  }

  // ✅ Aktualizace objednávky
  @Mutation(() => Order, { name: 'updateOrder' })
  updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('customerId', { type: () => Int, nullable: true }) customerId?: number,
    @Args('productId', { type: () => Int, nullable: true }) productId?: number,
    @Args('quantity', { type: () => Int, nullable: true }) quantity?: number,
  ): Promise<Order> {
    return this.ordersService.update(id, customerId, productId, quantity);
  }

  // ✅ Bezpečné smazání objednávky
  @Mutation(() => Boolean, { name: 'deleteOrder' })
  async deleteOrder(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    const deleted = await this.ordersService.delete(id);
    return deleted;
  }
}
