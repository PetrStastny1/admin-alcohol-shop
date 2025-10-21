import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field()
  customer!: string;

  @Field(() => Int)
  productId!: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Int)
  quantity!: number;

  @Field()
  date!: string;
}
