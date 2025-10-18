import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  customerId!: number;

  @Field(() => Int)
  productId!: number;

  @Field(() => Int)
  quantity!: number;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  quantity?: number;
}
