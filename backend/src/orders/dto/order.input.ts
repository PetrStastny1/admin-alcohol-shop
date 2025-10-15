import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class OrderInput {
  @Field(() => Int)
  customerId!: number;

  @Field(() => Int)
  productId!: number;

  @Field(() => Int)
  quantity!: number;
}
