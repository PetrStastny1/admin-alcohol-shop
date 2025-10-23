import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [Order], { name: 'orders' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Query(() => Order, { name: 'order' })
  @UseGuards(GqlAuthGuard)
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Query(() => [Order], { name: 'ordersByCustomer' })
  @UseGuards(GqlAuthGuard)
  async findByCustomer(@Args('customerId', { type: () => Int }) customerId: number): Promise<Order[]> {
    return this.ordersService.findByCustomer(customerId);
  }

  @Mutation(() => Order, { name: 'createOrder' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async createOrder(@Args('input') input: CreateOrderInput): Promise<Order> {
    return this.ordersService.create(input);
  }

  @Mutation(() => Order, { name: 'updateOrder' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async updateOrder(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateOrderInput,
  ): Promise<Order> {
    return this.ordersService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteOrder' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteOrder(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.ordersService.delete(id);
  }
}
