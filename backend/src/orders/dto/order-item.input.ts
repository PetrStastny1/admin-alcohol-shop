import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, Min, IsOptional } from 'class-validator';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  @IsInt()
  productId!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  categoryId?: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  price?: number;
}
