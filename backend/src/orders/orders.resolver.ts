import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [Order], { name: 'orders' })
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Query(() => Order, { name: 'order' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => Order, { name: 'createOrder' })
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Order> {
    return this.ordersService.create(input);
  }

  @Mutation(() => Order, { name: 'updateOrder' })
  async updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateOrderInput,
  ): Promise<Order> {
    return this.ordersService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteOrder' })
  async deleteOrder(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.ordersService.delete(id);
  }
}
