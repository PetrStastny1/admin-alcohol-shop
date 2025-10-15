import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class ProductInput {
  @Field()
  name!: string;

  @Field(() => Float)
  price!: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}
