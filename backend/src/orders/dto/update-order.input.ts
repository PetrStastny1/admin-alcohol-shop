import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput {
  @Field({ nullable: true })
  customer?: string;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  date?: string;
}
