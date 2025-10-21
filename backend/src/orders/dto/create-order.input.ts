import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, IsOptional } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsInt()
  customerId!: number;

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

  @Field({ nullable: true })
  @IsOptional()
  date?: string;
}
