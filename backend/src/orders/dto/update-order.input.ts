import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput {
  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  quantity?: number;
}
